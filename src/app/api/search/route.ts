import { SearchClient, AzureKeyCredential } from "@azure/search-documents";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();
    
    console.log("Search API called with query:", query);

    // Validate environment variables
    const searchEndpoint = process.env.AZURE_SEARCH_ENDPOINT;
    const searchIndex = process.env.AZURE_SEARCH_INDEX;
    const searchApiKey = process.env.AZURE_SEARCH_API_KEY;

    if (!searchEndpoint || !searchIndex || !searchApiKey) {
      console.error("Missing required environment variables:", {
        hasEndpoint: !!searchEndpoint,
        hasIndex: !!searchIndex,
        hasApiKey: !!searchApiKey
      });
      return NextResponse.json({ 
        error: "Search service configuration error",
        results: "Search temporarily unavailable. Please check configuration."
      }, { status: 500 });
    }

    const searchClient = new SearchClient(
      searchEndpoint,
      searchIndex,
      new AzureKeyCredential(searchApiKey)
    );

    // Updated search options - removed semantic search
    const searchResults = await searchClient.search(query, {
      top: 5,
      queryType: "simple", // Changed from "semantic" to "simple"
      // Removed semanticSearchOptions - this was causing the error
      select: ["content"], // Only select retrievable fields
      searchMode: "any", // Add search mode for better results
    });

    let resultText = "";
    let resultCount = 0;
    
    for await (const result of searchResults.results) {
      resultCount++;
      const document = result.document as any;
      
      // Better source identification for financial documents
      let sourceInfo = "";
      if (document.content) {
        // Use content preview as source
        const contentPreview = document.content
          ? document.content.substring(0, 100).replace(/\n/g, ' ').trim() + "..."
          : "Financial document";
        sourceInfo = contentPreview;
      } else {
        sourceInfo = "Financial consulting document";
      }
      
      // Format each result clearly for LLM parsing
      resultText += `[Document ${resultCount}: ${sourceInfo}]\n`;
      resultText += `${document.content}\n`;
      resultText += `---\n\n`;
    }

    // Add summary info for the LLM
    if (resultCount > 0) {
      const summaryText = `Found ${resultCount} relevant financial document${resultCount > 1 ? 's' : ''} for query: "${query}"\n\n${resultText}`;
      console.log("Search results being returned:", summaryText.substring(0, 500)); // Log first 500 chars
      return NextResponse.json({ results: summaryText });
    } else {
      const noResultsText = `No financial documents found for query: "${query}". This may be outside of Jon Fortt's financial consulting knowledge base.`;
      console.log("No search results found for query:", query);
      return NextResponse.json({ results: noResultsText });
    }
    
  } catch (error: any) {
    console.error("Search error:", error);
    return NextResponse.json({ 
      error: `Search service error: ${error.message}`,
      results: "Search temporarily unavailable. Please try again later."
    }, { status: 500 });
  }
}