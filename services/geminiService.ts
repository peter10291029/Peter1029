import { GoogleGenAI } from "@google/genai";
import { StockData, ScreenerResult } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to parse JSON from potential markdown code blocks
const extractJson = (text: string): any => {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("No JSON found in response");
  } catch (e) {
    console.error("JSON Parse Error", e, text);
    throw e;
  }
};

export const searchStockInfo = async (ticker: string): Promise<StockData> => {
  const model = "gemini-2.5-flash";
  
  const prompt = `
    搜索中国A股市场中股票代码或名称为 "${ticker}" 的最新实时行情数据。
    我需要以下具体数据点（请确保数据针对中国A股市场）：
    
    - 当前价格 (人民币)
    - 今日涨跌幅 (%)
    - 市盈率 (PE TTM)
    - 市净率 (PB)
    - 市销率 (PS)
    - 股息率 (Dividend Yield %)
    - 总市值
    - 所属板块和行业 (中文)
    - 公司一句话简介 (中文)
    
    如果无法通过搜索获取精确的实时数字，请使用最近的收盘数据。
    
    仅返回符合以下严格格式的 JSON 数据。不要在 JSON 之外添加 markdown 格式：
    {
      "symbol": "股票代码 (如 600519)",
      "name": "公司中文全称",
      "price": number,
      "changePercent": number,
      "pe": number (如果为负数或不可用，使用 0),
      "pb": number,
      "ps": number,
      "dividendYield": number (百分比数值, 例如 5.2 代表 5.2%),
      "marketCap": "string (例如 2.1万亿)",
      "sector": "板块名称 (中文)",
      "industry": "行业名称 (中文)",
      "description": "中文简介字符串"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from Gemini");
    
    const data = extractJson(text);
    
    return {
      ...data,
      lastUpdated: new Date().toLocaleTimeString('zh-CN'),
      valuationScore: calculateValuationScore(data)
    };
  } catch (error) {
    console.error("Stock search failed:", error);
    throw new Error("获取股票数据失败，请检查代码是否正确或稍后重试。");
  }
};

export const screenHighDividendStocks = async (): Promise<ScreenerResult[]> => {
  const model = "gemini-2.5-flash";
  
  const prompt = `
    在中国A股市场中寻找 5 只高质量、业绩稳定的上市公司，其当前的股息率（Dividend Yield）必须严格处于 5% 到 8% 之间。
    
    优先考虑以下公司：
    1. 拥有可靠的过往分红历史。
    2. 派息比率合理（分红可持续）。
    3. 行业多样化（不要只列出银行或高速公路，尝试涵盖不同行业）。
    
    请执行搜索以验证它们当前的股息率确实在 5-8% 范围内。

    以 JSON 数组格式返回结果，对象格式如下：
    [
      {
        "symbol": "股票代码 (如 601398)",
        "name": "公司名称",
        "price": number,
        "dividendYield": number (例如 6.5),
        "sector": "所属行业",
        "rationale": "简短推荐理由（中文，例如：'连续10年分红稳定，现金流充裕'）。"
      }
    ]
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from Gemini");

    const data = extractJson(text);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Screening failed:", error);
    throw new Error("筛选股票失败，请稍后重试。");
  }
};

export const generateAnalysisReport = async (stock: StockData): Promise<string> => {
  const model = "gemini-2.5-flash";
  
  const prompt = `
    为 ${stock.name} (${stock.symbol}) 生成一份简短、专业的A股投资分析摘要。
    
    数据背景:
    - 价格: ${stock.price}
    - 市盈率 (PE): ${stock.pe}
    - 股息率: ${stock.dividendYield}%
    - 行业: ${stock.sector}

    分析要求 (请用中文回答):
    1. 估值评价 (基于PE/PB判断是高估还是低估？)
    2. 股息安全性评价。
    3. 主要风险提示。
    
    字数控制在 200 字以内。使用纯文本格式，配合要点符号。
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text || "暂时无法生成分析报告。";
  } catch (error) {
    return "生成报告失败。";
  }
};

// Simple heuristic for demo purposes
function calculateValuationScore(data: any): number {
  let score = 50;
  if (data.pe > 0 && data.pe < 15) score += 20;
  if (data.pe > 25) score -= 10;
  if (data.pb < 1.5) score += 15;
  if (data.dividendYield > 4) score += 15;
  return Math.min(100, Math.max(0, score));
}