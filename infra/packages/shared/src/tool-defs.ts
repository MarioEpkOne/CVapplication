export const SUPPORTED_PAIRS = ["EUR/USD", "GBP/USD", "USD/JPY", "EUR/GBP"] as const;
export type ForexPair = (typeof SUPPORTED_PAIRS)[number];

export const FOREX_TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "get_price",
      description: "Get the current bid/ask price for a currency pair.",
      parameters: {
        type: "object",
        properties: {
          pair: {
            type: "string",
            enum: ["EUR/USD", "GBP/USD", "USD/JPY", "EUR/GBP"],
            description: "The currency pair to quote.",
          },
        },
        required: ["pair"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "risk_check",
      description: "Run a risk assessment before opening a trade. May reject if risk is too high.",
      parameters: {
        type: "object",
        properties: {
          pair: { type: "string", enum: ["EUR/USD", "GBP/USD", "USD/JPY", "EUR/GBP"] },
          direction: { type: "string", enum: ["long", "short"] },
          lots: { type: "number", description: "Position size in lots (e.g. 0.1)." },
        },
        required: ["pair", "direction", "lots"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "open_order",
      description: "Open a market order for a currency pair. Call risk_check first.",
      parameters: {
        type: "object",
        properties: {
          pair: { type: "string", enum: ["EUR/USD", "GBP/USD", "USD/JPY", "EUR/GBP"] },
          direction: { type: "string", enum: ["long", "short"] },
          lots: { type: "number" },
        },
        required: ["pair", "direction", "lots"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_positions",
      description:
        "Get all current open positions (persisted for this user), each with its orderId and unrealized P&L. Returns an empty list if there are none.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "close_all_positions",
      description: "Close every open position for this user. Returns the number closed.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "close_position",
      description:
        "Close a single open position by its orderId (from get_positions). Errors if no such position exists.",
      parameters: {
        type: "object",
        properties: {
          orderId: { type: "string", description: "The orderId of the position to close." },
        },
        required: ["orderId"],
      },
    },
  },
] as const;
