"use client";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { AIGCSidebar } from "@/components/ui/aigc-sidebar";
import { AudioHandler } from "@/lib/audio";
import { ProactiveEventManager } from "@/lib/proactive-event-manager";
import { cn } from "@/lib/utils";
import { PanelRightClose, PanelRightOpen } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  AvatarConfigVideoParams,
  Voice,
  EOUDetection,
  isFunctionCallItem,
  Modality,
  RTClient,
  RTInputAudioItem,
  RTResponse,
  TurnDetection,
} from "rt-client";
import { useHydratedChatStore, Message } from "../stores/chatStore";
import { DEFAULT_INSTRUCTIONS } from "../prompts";

interface ToolDeclaration {
  type: "function";
  name: string;
  parameters: object | null;
  description: string;
}

interface PredefinedScenario {
  name: string;
  instructions?: string;
  pro_active?: boolean;
  voice?: {
    custom_voice: boolean;
    deployment_id?: string;
    voice_name: string;
    temperature?: number;
  };
  avatar?: {
    enabled: boolean;
    customized: boolean;
    avatar_name: string;
  };
}

const predefinedTools = [
  {
    id: "search",
    label: "Search",
    tool: {
      type: "function",
      name: "search",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Search query for future trends and strategic foresight content",
          },
        },
        required: ["query"],
        additionalProperties: false,
      },
      // CUSTOMIZE: Update search tool description with your domain categories
      description:
        "Search the comprehensive {{DOMAIN}} knowledge base containing {{CONTENT_TYPES}}. CRITICAL: You MUST search for ALL types of {{QUESTION_TYPES}} questions including:\n\n" +
        "1. {{CATEGORY_1}}: {{DESCRIPTION}}\n" +
        "2. {{CATEGORY_2}}: {{DESCRIPTION}}\n" +
        "3. {{CATEGORY_3}}: {{DESCRIPTION}}\n" +
        "4. {{CATEGORY_4}}: {{DESCRIPTION}}\n" +
        "5. {{CATEGORY_5}}: {{DESCRIPTION}}\n" +
        "6. {{CATEGORY_6}}: {{DESCRIPTION}}\n" +
        "7. {{CATEGORY_7}}: {{DESCRIPTION}}\n" +
        "8. {{CATEGORY_8}}: {{DESCRIPTION}}\n\n" +
        "ALWAYS search the knowledge base to provide evidence-based guidance backed by real research findings and domain expertise.",
    } as ToolDeclaration,
    enabled: true,
  },
];


let peerConnection: RTCPeerConnection;


const ChatInterface = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [apiKey, setApiKey] = useState("");
  const [endpoint, setEndpoint] = useState("");
  const [entraToken, setEntraToken] = useState("");
  const [model, setModel] = useState("gpt-4o-realtime-preview");
  const [searchEndpoint, setSearchEndpoint] = useState("");
  const [searchApiKey, setSearchApiKey] = useState("");
  const [searchIndex, setSearchIndex] = useState("");
  const [searchContentField, setSearchContentField] = useState("content");
  const [searchIdentifierField, setSearchIdentifierField] = useState("people");
  const [recognitionLanguage, setRecognitionLanguage] = useState("auto");
  const [useNS, setUseNS] = useState(true);
  const [useEC, setUseEC] = useState(true);
  const [turnDetectionType, setTurnDetectionType] = useState<TurnDetection>({
    type: "server_vad",
  });
  const [eouDetectionType, setEouDetectionType] = useState<string>("none");
  const [removeFillerWords, setRemoveFillerWords] = useState(false);
  const [instructions, setInstructions] = useState(DEFAULT_INSTRUCTIONS);
  const [enableProactive, setEnableProactive] = useState(false);
  const [temperature, setTemperature] = useState(0.9);
  const [voiceTemperature, setVoiceTemperature] = useState(0.9);
  const [useCNV, setUseCNV] = useState(true);
  const [voiceName, setVoiceName] = useState("en-US-AvaNeural");
  const [customVoiceName, setCustomVoiceName] = useState("");
  const [voiceDeploymentId, setVoiceDeploymentId] = useState("");
  const [tools, setTools] = useState<ToolDeclaration[]>([predefinedTools[0].tool]);
  
  const { 
    setHasHydrated,
    messages,
    addMessage,
    updateLastMessage,
    isConnected,
    isConnecting,
    sessionId,
    setConnectionState,
    setSessionId,
    isRecording,
    setIsRecording,
    configLoaded,
    setConfigLoaded,
    currentMessage,
    setCurrentMessage
  } = useHydratedChatStore();
  
  const [enableSearch, setEnableSearch] = useState(true);
  const [audioLevel, setAudioLevel] = useState(0);
  const [predefinedScenarios, setPredefinedScenarios] = useState<
    Record<string, PredefinedScenario>
  >({});
  const [selectedScenario, setSelectedScenario] = useState<string>("");

  const [mode, setMode] = useState<"model" | "agent">("model");
  const [agentProjectName, setAgentProjectName] = useState("");
  const [agentId, setAgentId] = useState("");
  const [agents, setAgents] = useState<{ id: string; name: string }[]>([]);

  const clientRef = useRef<RTClient | null>(null);
  const audioHandlerRef = useRef<AudioHandler | null>(null);
  const proactiveManagerRef = useRef<ProactiveEventManager | null>(null);
  const isUserSpeaking = useRef(false);

  const sidebarMessages = useMemo(
    () => messages.filter((message) => message.type === "assistant" || message.type === "user"),
    [messages]
  );


  useEffect(() => {
    setHasHydrated();

    // Sidebar positioning breakpoint: 1367px (matches Tailwind desktop breakpoint)
    // > 1366px: Sidebar on right, open by default (desktop only)
    // ≤ 1366px: Sidebar at bottom, closed by default (includes ALL iPads, even 12.9" Pro at 1366px)
    const SIDEBAR_POSITION_BREAKPOINT = 1366;

    const handleResize = () => {
      if (window.innerWidth > SIDEBAR_POSITION_BREAKPOINT) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    const handleOrientationChange = () => {
      // Close sidebar on any orientation change if in tablet/mobile range
      if (window.innerWidth <= SIDEBAR_POSITION_BREAKPOINT) {
        setSidebarOpen(false);
      }
    };

    handleResize(); // Check on mount
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [setHasHydrated]);

  const addDebugMessage = (content: string) => {
    console.log("🔍 DEBUG:", content);
  };

  const CoachAvatar = () => (
    <div className="w-24 h-24 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg overflow-hidden border-[3px] border-neutral-accent-primary">
      <img
        src="/avatar_headshot.png"
        alt="{{AVATAR_NAME}} - {{AVATAR_TITLE}}"
        className="w-full h-full object-cover"
        style={{ objectPosition: 'center 20%', transform: 'scale(1.3)' }}
      />
    </div>
  );


  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch("/api/config");
        if (response.status === 404) {
          console.error("Config endpoint not found. Please ensure /api/config exists.");
          setConfigLoaded(false);
          return;
        }

        if (!response.ok) {
          throw new Error(`Config API returned ${response.status}`);
        }

        const config = await response.json();
        console.log("Config loaded successfully:", { ...config, hasApiKey: config.hasApiKey, hasSearchApiKey: config.hasSearchApiKey });
        
        if (config.endpoint) {
          setEndpoint(config.endpoint);
        }
        if (config.model) {
          setModel(config.model);
        }
        if (config.searchEndpoint) {
          setSearchEndpoint(config.searchEndpoint);
        }
        if (config.searchIndex) {
          setSearchIndex(config.searchIndex);
        }
        if (config.voiceDeploymentId) {
          setVoiceDeploymentId(config.voiceDeploymentId);
        }
        if (config.customVoiceName) {
          setCustomVoiceName(config.customVoiceName);
        }
        
        if (config.token) {
          setEntraToken(config.token);
        }
        
        if (config.pre_defined_scenarios) {
          setPredefinedScenarios(config.pre_defined_scenarios);
        }
        
        if (config.agent && config.agent.project_name) {
          setAgentProjectName(config.agent.project_name);
          if (Array.isArray(config.agent.agents)) {
            setAgents(config.agent.agents);
            if (config.agent.agents.length === 1) {
              setAgentId(config.agent.agents[0].id);
            }
          }
        }
        
        setConfigLoaded(true);
      } catch (error) {
        console.error("Failed to fetch config:", error);
        addMessage({
          type: "error",
          content: `Configuration error: ${error}. Please check your environment variables.`,
          timestamp: new Date()
        });
        setConfigLoaded(true);
      }
    };

    fetchConfig();
  }, [addMessage, setConfigLoaded]);

  const fetchApiKey = async () => {
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
      });
      
      if (!response.ok) {
        throw new Error(`Auth API returned ${response.status}`);
      }
      
      const authData = await response.json();
      return authData.apiKey;
    } catch (error) {
      console.error("Failed to fetch API key:", error);
      throw error;
    }
  };

  // CUSTOMIZE: Replace with your persona's introduction message
  // This message is shown when the conversation starts
  const INTRODUCTION_MESSAGE = "Hallo! Ich bin {{AVATAR_NAME}}, {{AVATAR_TITLE}} und {{ROLE_DESCRIPTION}}. Ich helfe Ihnen gerne mit {{EXPERTISE_AREA_DESCRIPTION}}.";

  const SUGGESTED_QUESTIONS = `Fragen Sie mich zum Beispiel:

- "Welche Megatrends werden die nächsten 10 Jahre prägen?"

- "Wie wird K.I. die Arbeitswelt in den kommenden Jahren verändern?"

- "Welche strategischen Anpassungen sollten Unternehmen jetzt vornehmen, um zukunftsfähig zu bleiben?"

- "Wie können wir schwache Signale für disruptive Veränderungen in unserer Branche erkennen?"`;

  const handleConnect = async () => {
    if (!isConnected) {
      try {
        setConnectionState(false, true);

        // Add introduction as first message
        addMessage({
          type: "assistant",
          content: INTRODUCTION_MESSAGE,
          timestamp: new Date()
        });

        // Add suggested questions as second message
        addMessage({
          type: "assistant",
          content: SUGGESTED_QUESTIONS,
          timestamp: new Date()
        });

        if (configLoaded) {
          try {
            const response = await fetch("/api/config");
            if (response.ok) {
              const config = await response.json();
              if (config.endpoint) {
                setEndpoint(config.endpoint);
              }
              if (config.token) {
                setEntraToken(config.token);
              }
            }
          } catch (error) {
            console.error("Failed to refresh token:", error);
          }
        }

        let authKey = "";
        if (!entraToken) {
          try {
            authKey = await fetchApiKey();
            setApiKey(authKey);
          } catch (error) {
            addMessage({
              type: "error",
              content: "Failed to authenticate. Please check your API configuration.",
              timestamp: new Date()
            });
            return;
          }
        }

        const clientAuth = entraToken
          ? {
              getToken: async (_: string) => ({
                token: entraToken,
                expiresOnTimestamp: Date.now() + 3600000,
              }),
            }
          : { key: authKey };
        
        if (mode === "agent" && !agentId) {
          addMessage({
            type: "error",
            content: "Please input/select an agent.",
            timestamp: new Date()
          });
          return;
        }
        
        clientRef.current = new RTClient(
          new URL(endpoint),
          clientAuth,
          mode === "agent"
            ? {
                modelOrAgent: {
                  agentId,
                  projectName: agentProjectName,
                  agentAccessToken: entraToken,
                },
                apiVersion: "2025-05-01-preview",
              }
            : {
                modelOrAgent: model,
                apiVersion: "2025-05-01-preview",
              }
        );
        
        console.log("Client created:", clientRef.current.connectAvatar);
        const modalities: Modality[] = ["text", "audio"];
        const turnDetection: TurnDetection = turnDetectionType;
        if (
          turnDetection &&
          eouDetectionType !== "none" &&
          isCascaded(mode, model)
        ) {
          turnDetection.end_of_utterance_detection = {
            model: eouDetectionType,
          } as EOUDetection;
        }
        if (turnDetection?.type === "azure_semantic_vad") {
          turnDetection.remove_filler_words = removeFillerWords;
        }
        
        const voice: Voice = useCNV
          ? {
              name: customVoiceName,
              endpoint_id: voiceDeploymentId,
              temperature: customVoiceName.toLowerCase().includes("dragonhd")
                ? voiceTemperature
                : undefined,
              type: "azure-custom",
            }
          : voiceName.includes("-")
            ? {
                name: voiceName,
                type: "azure-standard",
                temperature: voiceName.toLowerCase().includes("dragonhd")
                  ? voiceTemperature
                  : undefined,
              }
            : (voiceName as Voice);
            
        const session = await clientRef.current.configure({
          instructions: instructions?.length > 0 ? instructions : undefined,
          input_audio_transcription: {
            model: model.includes("realtime-preview")
              ? "whisper-1"
              : "azure-fast-transcription",
            language:
              recognitionLanguage === "auto" ? undefined : recognitionLanguage,
          },
          turn_detection: turnDetection,
          voice: voice,
          tools,
          temperature,
          modalities,
          input_audio_noise_reduction: useNS
            ? {
                type: "azure_deep_noise_suppression",
              }
            : null,
          input_audio_echo_cancellation: useEC
            ? {
                type: "server_echo_cancellation",
              }
            : null,
        });

        startResponseListener();
        if (audioHandlerRef.current) {
          audioHandlerRef.current.startSessionRecording();
        }

        setConnectionState(true, false);
        setSessionId(session.id);

        if (enableProactive) {
          proactiveManagerRef.current = new ProactiveEventManager(
            whenGreeting,
            whenInactive,
            10000
          );
          proactiveManagerRef.current.start();
        }
      } catch (error) {
        console.error("Connection failed:", error);
        addMessage({
          type: "error",
          content: "Error connecting to {{AVATAR_NAME}}: " + error,
          timestamp: new Date()
        });
        setConnectionState(false, false);
      }
    } else {
      await disconnect();
    }
  };

  const whenGreeting = async () => {
    if (clientRef.current) {
      try {
        await clientRef.current.generateResponse({ additional_instructions: " Welcome the user." });
      } catch (error) {
        console.error("Error generating greeting message:", error);
      }
    }
  };

  const whenInactive = async () => {
    if (clientRef.current) {
      try {
        await clientRef.current.sendItem({
          type: "message",
          role: "system",
          content: [
            {
              type: "input_text",
              text: "User hasn't response for a while, please say something to continue the conversation.",
            },
          ],
        });
        await clientRef.current.generateResponse();
      } catch (error) {
        console.error("Error sending no activity message:", error);
      }
    }
  };

  const disconnect = async () => {
    if (clientRef.current) {
      try {
        await clientRef.current.close();
        clientRef.current = null;
        peerConnection = null as unknown as RTCPeerConnection;
        setConnectionState(false, false);
        if (audioHandlerRef.current && typeof audioHandlerRef.current.stopStreamingPlayback === 'function') {
          audioHandlerRef.current.stopStreamingPlayback();
        }
        proactiveManagerRef.current?.stop();
        isUserSpeaking.current = false;
        audioHandlerRef.current?.stopRecordAnimation();
        audioHandlerRef.current?.stopPlayChunkAnimation();
        if (isRecording) {
          audioHandlerRef.current?.stopRecording();
          setIsRecording(false);
        }

        if (audioHandlerRef.current) {
          audioHandlerRef.current.stopSessionRecording();
        }
      } catch (error) {
        console.error("Disconnect failed:", error);
      }
    }
  };

  const handleResponse = async (response: RTResponse) => {
    let lastSearchResults = "";
    
    for await (const item of response) {
      if (item.type === "message" && item.role === "assistant") {
        const message: Message = {
          type: item.role,
          content: "",
          timestamp: new Date()
        };
        
        addMessage(message);
        
        let fullResponseText = "";
        
        for await (const content of item) {
          if (content.type === "text") {
            for await (const text of content.textChunks()) {
              message.content += text;
              fullResponseText += text;
              updateLastMessage(message.content);
            }
          } else if (content.type === "audio") {
            // Buffer for incoming transcript chunks
            let textBuffer = "";
            let isReceivingText = true;

            const textTask = async () => {
              for await (const text of content.transcriptChunks()) {
                textBuffer += text;
                fullResponseText += text;
              }
              isReceivingText = false;
            };

            const audioTask = async () => {
              audioHandlerRef.current?.stopStreamingPlayback();
              audioHandlerRef.current?.startStreamingPlayback();
              for await (const audio of content.audioChunks()) {
                audioHandlerRef.current?.playChunk(audio, async () => {
                  proactiveManagerRef.current?.updateActivity("agent speaking");
                });
              }
            };

            // Gradually reveal buffered text at ~15 characters per second (natural speech rate)
            const textRevealTask = async () => {
              const CHARS_PER_SECOND = 22;
              const INTERVAL_MS = 1000 / CHARS_PER_SECOND;

              while (isReceivingText || textBuffer.length > 0) {
                if (textBuffer.length > 0) {
                  // Reveal 1 character at a time
                  const char = textBuffer.charAt(0);
                  textBuffer = textBuffer.slice(1);
                  message.content += char;
                  updateLastMessage(message.content);
                  await new Promise(resolve => setTimeout(resolve, INTERVAL_MS));
                } else {
                  // Wait a bit if buffer is empty but still receiving
                  await new Promise(resolve => setTimeout(resolve, 50));
                }
              }
            };

            await Promise.all([textTask(), audioTask(), textRevealTask()]);
          }
        }
        
        if (fullResponseText && lastSearchResults) {
          validateResponse(fullResponseText, lastSearchResults);
        }
      } else if (isFunctionCallItem(item)) {
        addDebugMessage(`Function call detected: ${item.functionName}`);
        addDebugMessage(`Function call ID: ${item.callId}`);
        addDebugMessage(`Function arguments: ${item.arguments}`);
        
        await item.waitForCompletion();
        console.log("Function call completed:", item);
        
        if (item.functionName === "get_time") {
          const formattedTime = new Date().toLocaleString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            timeZoneName: "short",
          });
          console.log("Current time:", formattedTime);
          await clientRef.current?.sendItem({
            type: "function_call_output",
            output: formattedTime,
            call_id: item.callId,
          });
          await clientRef.current?.generateResponse();
        } else if (item.functionName === "search") {
          const query = JSON.parse(item.arguments).query;
          addDebugMessage(`Starting futurist research knowledge search for query: "${query}"`);

          // Future trends question type detection
          const isMegatrendQuestion = /\b(megatrend|demographic|societal|long[- ]term|global shift)\b/i.test(query);
          const isTechnologyQuestion = /\b(AI|automation|technology|digital|innovation|disrupt)\b/i.test(query);
          const isBusinessFutureQuestion = /\b(business model|organization|industry|transformation|future of work)\b/i.test(query);
          const isStrategicQuestion = /\b(strategy|foresight|scenario|planning|forecast)\b/i.test(query);
          const isWorkFutureQuestion = /\b(remote work|workplace|skills|employee|talent|workforce)\b/i.test(query);
          const hasPersonalQuestion = /\b(background|approach|experience|methodology|philosophy|who are you|2b ahead|think tank)\b/i.test(query);

          addDebugMessage(`Question type analysis: Megatrend=${isMegatrendQuestion}, Technology=${isTechnologyQuestion}, BusinessFuture=${isBusinessFutureQuestion}, Strategic=${isStrategicQuestion}`);

          const statusMessage = `Searching futurist research knowledge base [${query}]...`;
          addMessage({
            type: "status",
            content: statusMessage,
            timestamp: new Date()
          });

          try {
            let searchResults = "";

            // Enhance query based on detected question type
            let enhancedQuery = query;
            if (isMegatrendQuestion) {
              enhancedQuery = `${query} megatrend demographic societal transformation global shift`;
            } else if (isTechnologyQuestion) {
              enhancedQuery = `${query} AI automation technology digital disruption innovation`;
            } else if (isBusinessFutureQuestion) {
              enhancedQuery = `${query} business model organizational transformation industry disruption`;
            } else if (isWorkFutureQuestion) {
              enhancedQuery = `${query} future of work remote workplace skills workforce`;
            } else if (isStrategicQuestion) {
              enhancedQuery = `${query} strategic foresight scenario planning forecast trend`;
            } else if (hasPersonalQuestion) {
              // CUSTOMIZE: Update query enhancement with your persona details
              enhancedQuery = `${query} {{AVATAR_NAME}} {{AVATAR_TITLE}} {{ORG_NAME}} approach methodology`;
            }
            
            addDebugMessage(`Enhanced search query: "${enhancedQuery}"`);
            
            const response = await fetch('/api/search', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ query: enhancedQuery })
            });

            if (!response.ok) {
              throw new Error(`Search API error: ${response.status}`);
            }

            const searchData = await response.json();
            searchResults = searchData.results;
            lastSearchResults = searchResults;
            
            addDebugMessage(`Futurist research knowledge search returned ${searchResults.length} characters of data`);
            console.log("Futurist research knowledge search results:", searchResults);

            const futuristContext = `📋 FUTURIST RESEARCH KNOWLEDGE BASE:

${searchResults}

🎯 INSTRUCTIONS: You are {{AVATAR_NAME}}, a {{AVATAR_TITLE}} with expertise in {{EXPERTISE_AREAS}}. Use the specific information above to provide expert analysis and guidance.

CRITICAL PRIVACY POLICY: Speak as yourself - "I'm {{AVATAR_NAME}}" or "I". Only reference information, data, and insights from your knowledge base. Do not invent statistics, claims, or information not in your research.

WELCOME APPROACH: When starting conversations, introduce yourself naturally: "I'm {{AVATAR_NAME}}, {{AVATAR_TITLE}} and {{ROLE_DESCRIPTION}}. I {{EXPERTISE_DESCRIPTION}}. What would you like to explore?"

FUTURIST APPROACH:
- Draw from specific research findings and trend analyses in the knowledge base
- Reference relevant megatrends, technological disruptions, and strategic frameworks
- Provide informed guidance on scenario planning, weak signal detection, and strategic foresight
- Use concrete examples from real-world cases (e.g., "organizations I've worked with")
- Explain complex trends and future scenarios in accessible language
- Always ground predictions in actual research data
- Ask clarifying questions about their industry, timeframe, and strategic context

RESPONSE REQUIREMENTS:
- Quote specific trends and strategic insights from your research materials
- Reference relevant patterns and frameworks when mentioned in your knowledge base (do not invent)
- Provide actionable strategic foresight based on the questioner's context
- Share relevant insights from your trend research and consulting work
- Use conversational but professional language appropriate for strategic consulting
- Keep responses 3-5 sentences for clarity and focus
- Only provide longer responses when detailed trend analysis is necessary
- Tailor insights to the specific strategic question being discussed

This is expert futurist guidance backed by comprehensive trend research and strategic foresight expertise.`;

            addDebugMessage("Sending futurist research context to LLM");
            addDebugMessage(`Context length: ${futuristContext.length} characters`);

            await clientRef.current?.sendItem({
              type: "function_call_output",
              output: futuristContext,
              call_id: item.callId,
            });

            addDebugMessage("Futurist research context sent successfully");

            await new Promise(resolve => setTimeout(resolve, 100));

            // CUSTOMIZE: Update system constraint with your persona details
            const systemConstraint = `SYSTEM OVERRIDE: You are {{AVATAR_NAME}}, a {{AVATAR_TITLE}} responding to a question about {{DOMAIN}}.

CRITICAL POLICY: Speak as yourself - "I'm {{AVATAR_NAME}}" or "I". Only reference information, data, and insights from your knowledge base. Do not invent statistics or claims.

CRITICAL INSTRUCTIONS:
- Base your response ONLY on the futurist research knowledge provided in the search results
- Speak with expertise and authority in megatrends, technology disruption, and strategic foresight
- Provide specific, actionable strategic insights and trend analysis
- Reference relevant research findings or case studies when appropriate
- Use concrete examples and frameworks from your trend research
- Explain future trends and scenarios clearly and accessibly
- Ask follow-up questions about their industry context, timeframe, and strategic goals when needed
- Do not invent trends, statistics, or predictions not in your knowledge base

RESPONSE FORMAT:
- Start with a direct answer to their question
- Provide specific megatrends or strategic insights from your research materials
- Explain the strategic implications and future scenarios
- Offer informed futurist perspective based on your trend research and consulting work
- Invite follow-up questions to better understand their specific context

Remember: You are providing professional futurist guidance. Be informed, data-driven, and strategically focused. Help them understand emerging patterns and make better strategic choices today.`;

            addDebugMessage(`Sending futurist research system constraint`);
            
            await clientRef.current?.sendItem({
              type: "message",
              role: "system", 
              content: [
                {
                  type: "input_text",
                  text: systemConstraint,
                },
              ],
            });
            
            addDebugMessage("System constraint sent");
            await new Promise(resolve => setTimeout(resolve, 50));
            
            addDebugMessage("Generating CPA response...");
            await clientRef.current?.generateResponse();
            addDebugMessage("Response generation triggered");
            
          } catch (error) {
            console.error("Futurist research knowledge search error:", error);
            addDebugMessage(`Futurist research knowledge search error: ${error}`);
            const errorMessage = "My research knowledge base is temporarily unavailable. I can still discuss general trends and strategic foresight based on my expertise. Please try your question again.";
            await clientRef.current?.sendItem({
              type: "function_call_output",
              output: errorMessage,
              call_id: item.callId,
            });
            await clientRef.current?.generateResponse();
          }
        }
      }
    }
    if (response.status === "failed") {
      addDebugMessage(`Response failed: ${JSON.stringify(response.statusDetails)}`);
      addMessage({
        type: "error",
        content: "Response failed:" + JSON.stringify(response.statusDetails),
        timestamp: new Date()
      });
    }
  };

  const validateResponse = (responseText: string, searchResults: string) => {
    const violations = [];

    // Generic phrases that should NOT appear in professional financial coaching responses
    const genericPhrases = [
      'I don\'t have specific details',
      'generally speaking',
      'it depends entirely on your situation',
      'this is general information only',
      'every situation is different',
      'I cannot provide specific advice',
      'you should definitely consult a futurist',
      'only time will tell'
    ];

    genericPhrases.forEach(phrase => {
      if (responseText.toLowerCase().includes(phrase.toLowerCase())) {
        violations.push(`❌ GENERIC RESPONSE: Used vague phrase "${phrase}" instead of specific futurist insights`);
      }
    });

    // Check for specific futurist expertise markers
    const hasSpecificGuidance = /\b(trend|megatrend|future|technology|disruption|innovation|strategy|foresight|scenario)\b/i.test(responseText);
    const hasClientExamples = responseText.toLowerCase().includes('organization') || responseText.toLowerCase().includes('case') || responseText.toLowerCase().includes('similar') || responseText.toLowerCase().includes('research');
    const hasActionableAdvice = /\b(recommend|consider|anticipate|prepare|adapt|transform|evolve|forecast)\b/i.test(responseText);
    const hasFuturistTerms = /\b(trend|future|megatrend|technology|business|transformation|innovation|strategic|forecast|digital)\b/i.test(responseText);

    if (!hasSpecificGuidance && responseText.length > 50) {
      violations.push(`❌ SPECIFICITY: Response lacks specific future trends or strategic foresight guidance`);
    }

    if (!hasActionableAdvice && responseText.length > 50) {
      violations.push(`❌ ACTIONABILITY: Response lacks concrete, actionable strategic recommendations`);
    }

    if (!hasFuturistTerms && responseText.length > 50) {
      violations.push(`❌ EXPERTISE: Response lacks professional futurist terminology`);
    }

    // Positive quality markers
    const hasNumbers = /\$|%|\d+/.test(responseText);
    const hasExamples = responseText.includes('example') || responseText.includes('instance') || responseText.includes('case');
    const hasSpecificStrategies = responseText.includes('strategy') || responseText.includes('approach') || responseText.includes('method');

    if (violations.length > 0) {
      addDebugMessage(`FUTURIST RESPONSE QUALITY ISSUES:`);
      violations.forEach(violation => addDebugMessage(violation));
      addDebugMessage(`Response should provide specific, actionable futurist guidance based on research content`);
    } else {
      addDebugMessage(`✅ FUTURIST VALIDATION PASSED: Response provides professional trend analysis and strategic foresight`);
      if (hasNumbers) addDebugMessage(`✅ Contains specific figures/metrics`);
      if (hasExamples) addDebugMessage(`✅ Includes concrete examples`);
      if (hasSpecificStrategies) addDebugMessage(`✅ Provides specific strategies`);
      if (hasClientExamples) addDebugMessage(`✅ References research findings or case studies`);
    }
  };

  const handleInputAudio = async (item: RTInputAudioItem) => {
    isUserSpeaking.current = true;
    audioHandlerRef.current?.stopStreamingPlayback();
    await item.waitForCompletion();
    isUserSpeaking.current = false;
    
    const userMessage = item.transcription || "";
    
    addMessage({
      type: "user",
      content: userMessage,
      timestamp: new Date()
    });
  };

  const startResponseListener = async () => {
    if (!clientRef.current) return;

    try {
      for await (const serverEvent of clientRef.current.events()) {
        if (serverEvent.type === "response") {
          await handleResponse(serverEvent);
        } else if (serverEvent.type === "input_audio") {
          proactiveManagerRef.current?.updateActivity("user start to speak");
          await handleInputAudio(serverEvent);
        }
      }
    } catch (error) {
      if (clientRef.current) {
        console.error("Response iteration error:", error);
      }
    }
  };

  const sendMessage = async () => {
    if (currentMessage.trim() && clientRef.current) {
      try {
        const temporaryStorageMessage = currentMessage;
        setCurrentMessage("");
        
        addMessage({
          type: "user",
          content: temporaryStorageMessage,
          timestamp: new Date()
        });

        await clientRef.current.sendItem({
          type: "message",
          role: "user",
          content: [{ type: "input_text", text: temporaryStorageMessage }],
        });
        await clientRef.current.generateResponse();
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    }
  };

  const toggleRecording = async () => {
    if (!isRecording && clientRef.current) {
      // Start recording
      try {
        // Stop any ongoing audio playback when starting a new recording
        audioHandlerRef.current?.stopStreamingPlayback();

        if (!audioHandlerRef.current) {
          audioHandlerRef.current = new AudioHandler();
          await audioHandlerRef.current.initialize();
        }
        await audioHandlerRef.current.startRecording(async (chunk) => {
          const int16Data = new Int16Array(chunk.buffer);
          const rms = Math.sqrt(int16Data.reduce((acc, val) => acc + val * val, 0) / int16Data.length);
          const normalizedLevel = Math.min(1, rms / 10000);
          setAudioLevel(normalizedLevel);

          await clientRef.current?.sendAudio(chunk);
          if (isUserSpeaking.current) {
            proactiveManagerRef.current?.updateActivity("user speaking");
          }
        });
        setIsRecording(true);
      } catch (error) {
        console.error("Failed to start recording:", error);
      }
    } else if (isRecording && audioHandlerRef.current) {
      // Stop recording
      try {
        audioHandlerRef.current.stopRecording();
        audioHandlerRef.current.stopRecordAnimation();
        setAudioLevel(0);
        if (turnDetectionType === null) {
          const inputAudio = await clientRef.current?.commitAudio();
          proactiveManagerRef.current?.updateActivity("user speaking");
          await handleInputAudio(inputAudio!);
          await clientRef.current?.generateResponse();
        }
        setIsRecording(false);
      } catch (error) {
        console.error("Failed to stop recording:", error);
      }
    }
  };

  useEffect(() => {
    const initAudioHandler = async () => {
      const handler = new AudioHandler();
      await handler.initialize();
      audioHandlerRef.current = handler;
    };

    initAudioHandler().catch(console.error);

    return () => {
      disconnect();
      audioHandlerRef.current?.close().catch(console.error);
    };
  }, []);

  useEffect(() => {
    const element = document.getElementById("messages-area");
    if (element) {
      element.scrollTop = element.scrollHeight;
    }
  }, [messages]);

  function isCascaded(mode: "model" | "agent", model: string): boolean {
    if (mode === "agent") return true;
    const cascadedModels = [
      "gpt-4o",
      "gpt-4o-mini",
      "gpt-4.1",
      "gpt-4.1-mini",
      "gpt-4.1-nano",
      "phi4-mini",
    ];
    return cascadedModels.includes(model);
  }

  return (
    <div className="min-h-screen bg-neutral-light text-neutral-text-primary">
      <div className={cn(
        "mx-auto flex h-screen max-w-[1600px] flex-col p-0",
        "desktop:pr-[400px]" // Make room for fixed sidebar on desktop (iPad Pro landscape+)
      )}>
        <section className="flex flex-1 flex-col overflow-hidden bg-neutral-light">
          {/* Header - Outside border */}
          <header className="mx-6 px-8 py-6 max-desktop:py-4 bg-neutral-light">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4 max-desktop:mb-2">
              <div className="flex items-center gap-4">
                <CoachAvatar />
                <div>
                  <h1 className="desktop:text-[2rem] text-[1.75rem] leading-tight max-desktop:text-[1.5rem] max-tablet:text-[1.25rem] font-semibold text-neutral-text-primary" style={{ letterSpacing: '-0.02em' }}>
                    {/* CUSTOMIZE: Replace with your avatar name */}
                    {{AVATAR_NAME}}
                  </h1>
                  <p className="desktop:text-[17px] text-base text-neutral-text-secondary mt-1">{/* CUSTOMIZE: Replace with subtitle */}{{AVATAR_SUBTITLE}}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {isConnected ? (
                  <Button
                    onClick={handleConnect}
                    variant="outline"
                    size="default"
                    className="rounded-full border-[3px] border-neutral-accent-primary bg-white px-8 text-neutral-accent-primary hover:bg-neutral-accent-primary hover:text-white transition-all desktop:text-[18px] text-lg font-semibold"
                  >
                    Trennen
                  </Button>
                ) : (
                  <Button
                    onClick={handleConnect}
                    disabled={isConnecting}
                    className="rounded-full border-[3px] border-neutral-accent-primary bg-neutral-accent-primary px-8 text-white hover:bg-neutral-accent-hover hover:border-neutral-accent-hover shadow-wine-md transition-all desktop:text-[18px] text-lg font-semibold"
                  >
                    {isConnecting ? "Verbinden…" : "Verbinden"}
                  </Button>
                )}
              </div>
            </div>
          </header>

          {/* Chat Wrapper - messages + controls only */}
          <div className="flex flex-1 flex-col overflow-hidden mx-6 mb-6 rounded-2xl border-[3px] border-neutral-accent-primary shadow-lg relative bg-white">

            <div
              className="flex-1 overflow-y-auto"
              id="messages-area"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              <style jsx>{`
                #messages-area::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              <div className="p-6 pr-3">
                {!isConnected && messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-accent-primary/20 mb-6">
                      <svg className="h-10 w-10 text-neutral-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                    </div>
                    {/* CUSTOMIZE: Replace with your welcome text */}
                    <h3 className="desktop:text-[22px] text-xl font-semibold text-neutral-text-primary mb-3">Willkommen bei {{AVATAR_NAME}}</h3>
                    <p className="desktop:text-[17px] text-base text-neutral-text-secondary max-w-md mb-6">Klicken Sie auf die Schaltfläche „Verbinden", um Ihr Gespräch mit {{AVATAR_TITLE_ARTICLE}} zu beginnen.</p>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-8">
                  {messages.map((message, index) => {
                    if (message.type === "user") {
                      return (
                        <div key={index} className="flex justify-end">
                          <div className="max-w-[70%] rounded-[18px] rounded-br-[4px] bg-gradient-to-br from-neutral-accent-primary to-neutral-accent-hover px-6 py-4 text-white shadow-wine-sm">
                            <p className="text-[15px] tablet:text-[17px] desktop:text-[17px] leading-relaxed" style={{ whiteSpace: 'pre-line' }}>{message.content}</p>
                          </div>
                        </div>
                      );
                    } else if (message.type === "assistant") {
                      return (
                        <div key={index} className="flex justify-start">
                          <div className="max-w-[70%] rounded-[18px] rounded-bl-[4px] px-6 py-4 shadow-sm border-[2px] border-neutral-accent-primary bg-gradient-to-br from-neutral-light to-neutral-off-white">
                            <p className="text-[15px] tablet:text-[17px] desktop:text-[17px] leading-relaxed text-neutral-text-primary" style={{ whiteSpace: 'pre-line' }}>{message.content}</p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
                )}
              </div>
            </div>

            <footer className="border-t border-neutral-border bg-white px-8 pt-6 relative pb-8 max-desktop:pb-28" style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}>
              <div className="flex flex-col items-center gap-6 max-desktop:mb-8">
                <Button
                  onClick={toggleRecording}
                  disabled={!isConnected}
                  size="icon"
                  className={`h-20 w-20 rounded-full text-white shadow-2xl transition-all duration-300 border-2 ${
                    isRecording
                      ? "bg-red-500 hover:bg-red-600 animate-pulse ring-4 ring-red-500/50 border-red-600"
                      : "bg-neutral-accent-primary border-neutral-accent-primary hover:bg-neutral-accent-hover hover:border-neutral-accent-hover"
                  }`}
                >
                  <img src="/mic.png" alt="Microphone" className="h-12 w-12 invert" />
                </Button>
              </div>
            </footer>

          </div>
        </section>

        {/* Sidebar - Desktop (≥1367px): fixed right, Tablet/Mobile (<1367px): bottom sheet */}
        <aside className={cn(
          "flex w-full flex-col bg-neutral-darkest",
          "desktop:fixed desktop:right-0 desktop:top-0 desktop:h-screen desktop:w-[400px] desktop:border-l desktop:border-neutral-light/20",
          // Tablet & Mobile: bottom sheet behavior (includes iPad Pro)
          "max-desktop:fixed max-desktop:inset-x-0 max-desktop:bottom-0 max-desktop:top-auto max-desktop:z-50",
          "max-desktop:rounded-t-3xl max-desktop:shadow-2xl max-desktop:max-h-[75vh] max-desktop:overflow-y-auto max-desktop:overflow-x-hidden",
          "max-desktop:transition-all max-desktop:duration-[450ms] max-desktop:ease-[cubic-bezier(0.22,1,0.36,1)]",
          !sidebarOpen && "max-desktop:translate-y-full",
          !sidebarOpen && "hidden desktop:flex"
        )} style={{
          willChange: sidebarOpen ? 'transform' : 'auto',
          touchAction: 'pan-y',
          boxSizing: 'border-box',
        }}>
          {sidebarOpen ? (
            <div className="relative h-full max-w-full overflow-x-hidden" style={{ boxSizing: 'border-box' }}>
              {/* Pull indicator for tablet/mobile */}
              <div className="sticky top-0 w-full py-2 flex justify-center bg-white/95 backdrop-blur-sm max-desktop:block desktop:hidden z-20 border-b border-neutral-border" style={{ maxWidth: '100%' }}>
                <div className="w-12 h-1.5 bg-neutral-text-muted rounded-full" />
              </div>

              {/* Close button */}
              <Button
                size="icon"
                variant="ghost"
                className="max-desktop:sticky max-desktop:top-[28px] max-desktop:w-full max-desktop:py-4 max-desktop:rounded-none max-desktop:border-b max-desktop:border-neutral-border max-desktop:bg-white/95 max-desktop:backdrop-blur-sm desktop:absolute desktop:right-4 desktop:top-4 z-10 h-10 w-10 rounded-full border-[2px] border-neutral-accent-primary bg-white text-neutral-accent-primary hover:bg-neutral-accent-primary hover:text-white transition-transform hover:scale-110"
                onClick={() => setSidebarOpen(false)}
              >
                <PanelRightClose className="h-5 w-5 max-desktop:hidden" />
                <svg className="h-9 w-9 hidden max-desktop:block" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </Button>

              <AIGCSidebar
                messages={sidebarMessages}
                isConnected={isConnected}
                className="h-full"
              />
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center bg-neutral-off-white">
              <p className="text-sm font-semibold text-neutral-text-primary">K.I.-Studio</p>
              <Button
                variant="outline"
                className="gap-2 border-[3px] border-neutral-accent-primary bg-white text-neutral-accent-primary hover:bg-neutral-accent-primary hover:text-white"
                onClick={() => setSidebarOpen(true)}
              >
                <PanelRightOpen className="h-4 w-4" />
                Sidebar öffnen
              </Button>
            </div>
          )}
        </aside>

        {/* Backdrop for tablet/mobile bottom sheet */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 max-desktop:block desktop:hidden animate-in fade-in duration-300"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Tablet & Mobile sidebar toggle button - Capsule at bottom center */}
        {!sidebarOpen && (
          <Button
            size="default"
            variant="ghost"
            className="fixed left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full border-[3px] border-neutral-accent-primary bg-white text-neutral-accent-primary shadow-wine-md hover:bg-neutral-accent-primary hover:text-white desktop:hidden flex items-center gap-2 transition-transform hover:scale-105"
            style={{ bottom: 'max(40px, calc(36px + env(safe-area-inset-bottom)))' }}
            onClick={() => setSidebarOpen(true)}
          >
            <PanelRightOpen className="h-5 w-5" />
            <span className="font-medium text-[16px]">K.I.-Studio öffnen</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
