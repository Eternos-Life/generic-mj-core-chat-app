// The ProactiveEventManager for Jon Fortt interviews
// Hard-coded to work with the specific Jon Fortt configuration
export class ProactiveEventManager {
    public onGreeting: () => Promise<void> = async () => {
        // Default greeting handler - Jon Fortt introduction
    }
    
    public onNoActivity: () => Promise<void> = async () => {
        // Default no activity handler - Jon Fortt follow-up questions
    }
    
    private lastActivityTime: Date;
    private timer!: NodeJS.Timeout;
    private interval: number;
    
    constructor(onGreeting: () => Promise<void>, onInactive: () => Promise<void>, interval: number = 60000) {
        this.lastActivityTime = new Date(); // Initialize with current time
        this.onGreeting = onGreeting;
        this.onNoActivity = onInactive;
        this.interval = interval; // Set the interval for inactivity check
        
        // Log initialization with Jon Fortt branding
        console.log('Jon Fortt Proactive Event Manager initialized');
        console.log('Powered by Eternos - AI Interview Twin Technology');
    }

    /**
     * Updates the last activity time to the current time
     * Tracks different types of activities in Jon Fortt interviews
     */
    public updateActivity(activityName: string = ""): void {
        this.lastActivityTime = new Date();
        
        // Log activity for Jon Fortt interview context
        if (activityName) {
            console.log(`Interview activity: ${activityName} at ${this.lastActivityTime.toISOString()}`);
        }
    }

    /**
     * Starts the inactivity timer that checks for inactivity every minute
     * Customized for Jon Fortt interview flow
     */
    public start(): void {
        console.log('Starting Jon Fortt interview session...');
        this.onGreeting();
        this.stopTimer(); // Ensure no existing timer is running
    
        // Start a new timer that will begin checking after the first interval
        this.timer = setTimeout(() => {
            this.startRecurringCheck();
        }, this.interval);
    }

    /**
     * Starts the recurring interval check for inactivity
     * Optimized for interview conversation flow
     */
    private startRecurringCheck(): void {
        // Clear any existing timer first to prevent duplicates
        this.stopTimer();
        
        // Set up the recurring interval for interview management
        this.timer = setInterval(async () => {
            await this.checkInactivity();
        }, this.interval);
    }

    /**
     * Stops any running timer
     */
    private stopTimer(): void {
        if (this.timer) {
            clearTimeout(this.timer);
            clearInterval(this.timer);
            this.timer = null as unknown as NodeJS.Timeout; // Reset the timer to null
        }
    }

    /**
     * Checks if the last activity was over the interval ago
     * Provides Jon Fortt-style follow-up questions when inactive
     */
    private async checkInactivity(): Promise<void> {
        const now = new Date();
        const timeDifference = now.getTime() - this.lastActivityTime.getTime();
        
        if (timeDifference > this.interval) {
            console.log('Detected inactivity in Jon Fortt interview - triggering follow-up');
            await this.onNoActivity();
            this.lastActivityTime = now; // Reset the last activity time
        }
    }

    /**
     * Provides interview context and statistics
     */
    public getInterviewStats(): {
        sessionDuration: number;
        lastActivity: Date;
        isActive: boolean;
    } {
        const now = new Date();
        const sessionDuration = now.getTime() - this.lastActivityTime.getTime();
        const isActive = sessionDuration <= this.interval;
        
        return {
            sessionDuration: Math.floor(sessionDuration / 1000), // in seconds
            lastActivity: this.lastActivityTime,
            isActive
        };
    }

    /**
     * Cleans up the timer to prevent memory leaks
     * Ends the Jon Fortt interview session
     */
    public stop(): void {
        console.log('Ending Jon Fortt interview session...');
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        const stats = this.getInterviewStats();
        console.log(`Interview session ended. Duration: ${stats.sessionDuration} seconds`);
    }
}
