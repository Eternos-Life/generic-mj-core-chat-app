import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { redisManager } from "@/lib/redis/client";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const healthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      postgres: {
        status: 'unknown',
        message: '',
        responseTime: 0
      },
      redis: {
        status: 'unknown',
        message: '',
        responseTime: 0
      }
    }
  };

  // Test PostgreSQL connection using Prisma
  const prisma = new PrismaClient();
  const pgStart = Date.now();
  
  try {
    // Simple query to test connection
    await prisma.$queryRaw`SELECT 1`;
    healthStatus.services.postgres.status = 'healthy';
    healthStatus.services.postgres.message = 'Connected successfully';
    healthStatus.services.postgres.responseTime = Date.now() - pgStart;
  } catch (error: any) {
    healthStatus.services.postgres.status = 'unhealthy';
    healthStatus.services.postgres.message = error.message || 'Connection failed';
    healthStatus.services.postgres.responseTime = Date.now() - pgStart;
    healthStatus.status = 'unhealthy';
  } finally {
    await prisma.$disconnect();
  }

  // Test Redis connection using the same redis manager
  const redisStart = Date.now();
  
  try {
    const client = await redisManager.getClient();
    
    // Test basic operation
    const pingResult = await client.ping();
    
    if (pingResult === 'PONG') {
      healthStatus.services.redis.status = 'healthy';
      healthStatus.services.redis.message = 'Connected successfully';
    } else {
      healthStatus.services.redis.status = 'unhealthy';
      healthStatus.services.redis.message = 'Unexpected ping response';
      healthStatus.status = 'unhealthy';
    }
    
    healthStatus.services.redis.responseTime = Date.now() - redisStart;
  } catch (error: any) {
    healthStatus.services.redis.status = 'unhealthy';
    healthStatus.services.redis.message = error.message || 'Connection failed';
    healthStatus.services.redis.responseTime = Date.now() - redisStart;
    healthStatus.status = 'unhealthy';
  }

  // Return appropriate status code based on health
  const statusCode = healthStatus.status === 'healthy' ? 200 : 503;
  
  return NextResponse.json(healthStatus, { status: statusCode });
}
