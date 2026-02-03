import { describe, it, expect } from "vitest";
import {
  calculateShow,
  calculateDRE,
  calculateProjectProgress,
  calculateMonthlyProjection,
  formatCurrency,
  formatPercentage,
  calculateShowDRE,
  getShowsAnalysis,
} from "../calculations";
import { Show, Expense, FixedExpense, Project, Income } from "@/types";

// Test data factories
const createMockShow = (overrides: Partial<Show> = {}): Show => ({
  id: "1",
  date: "2024-12-15",
  time: "21:00",
  local: "Test Venue",
  tipo: "Bar",
  cache: 1000,
  numMusicos: 1,
  consumacao: 50,
  kmRodados: 100,
  combustivel: 150,
  pedagio: 20,
  roupas: 0,
  equipamentos: 0,
  outrosCustos: 30,
  pagamentoMusicos: 200,
  ...overrides,
});

describe("calculateShow", () => {
  it("should calculate total expenses correctly", () => {
    const show = createMockShow({
      combustivel: 100,
      pedagio: 20,
      roupas: 50,
      equipamentos: 30,
      consumacao: 40,
      pagamentoMusicos: 200,
      outrosCustos: 10,
    });

    const result = calculateShow(show);

    expect(result.totalGastos).toBe(450); // 100+20+50+30+40+200+10
  });

  it("should calculate real profit correctly", () => {
    const show = createMockShow({
      cache: 1000,
      combustivel: 100,
      pedagio: 20,
      roupas: 0,
      equipamentos: 0,
      consumacao: 30,
      pagamentoMusicos: 200,
      outrosCustos: 50,
    });

    const result = calculateShow(show);

    expect(result.lucroReal).toBe(600); // 1000 - 400
  });

  it("should calculate margin percentage correctly", () => {
    const show = createMockShow({
      cache: 1000,
      combustivel: 100,
      pedagio: 0,
      roupas: 0,
      equipamentos: 0,
      consumacao: 0,
      pagamentoMusicos: 0,
      outrosCustos: 0,
    });

    const result = calculateShow(show);

    expect(result.margemPercentual).toBe(90); // (900/1000) * 100
  });

  it("should handle zero cache gracefully", () => {
    const show = createMockShow({ cache: 0 });

    const result = calculateShow(show);

    expect(result.margemPercentual).toBe(0);
    expect(result.lucroReal).toBeLessThan(0);
  });

  it("should determine if show was worth it", () => {
    const profitableShow = createMockShow({ cache: 1000, combustivel: 100 });
    const unprofitableShow = createMockShow({ cache: 100, combustivel: 500 });

    expect(calculateShow(profitableShow).valeuAPena).toBe(true);
    expect(calculateShow(unprofitableShow).valeuAPena).toBe(false);
  });

  it("should calculate average fuel cost per km", () => {
    const show = createMockShow({
      kmRodados: 100,
      combustivel: 200,
    });

    const result = calculateShow(show);

    expect(result.precoMedioCombustivel).toBe(2); // 200/100
  });

  it("should handle zero km gracefully", () => {
    const show = createMockShow({
      kmRodados: 0,
      combustivel: 200,
    });

    const result = calculateShow(show);

    expect(result.precoMedioCombustivel).toBe(0);
  });
});

describe("calculateDRE", () => {
  const mockShows: Show[] = [
    createMockShow({ cache: 1000 }),
    createMockShow({ id: "2", cache: 1500 }),
  ];

  const mockExpenses: Expense[] = [
    { id: "1", category: "combustivel", description: "Gas", amount: 100, date: "2024-12-01" },
  ];

  const mockFixedExpenses: FixedExpense[] = [
    { id: "1", description: "Rent", amount: 500, dueDay: 10 },
  ];

  it("should calculate gross revenue from shows", () => {
    const result = calculateDRE(mockShows, [], []);

    expect(result.receitaBruta).toBe(2500);
  });

  it("should include other income in gross revenue", () => {
    const incomes: Income[] = [
      { id: "1", description: "Lessons", amount: 300, date: "2024-12-01", source: "lessons" },
    ];

    const result = calculateDRE(mockShows, [], [], incomes);

    expect(result.receitaBruta).toBe(2800); // 2500 + 300
  });

  it("should calculate direct costs from show expenses", () => {
    const result = calculateDRE(mockShows, [], []);

    // Sum of totalGastos from both shows
    expect(result.custosDirectos).toBeGreaterThan(0);
  });

  it("should calculate fixed expenses", () => {
    const result = calculateDRE([], mockExpenses, mockFixedExpenses);

    expect(result.despesasFixas).toBe(600); // 100 + 500
  });

  it("should calculate operational result correctly", () => {
    const simpleShows = [createMockShow({ 
      cache: 1000, 
      combustivel: 0, 
      pedagio: 0, 
      roupas: 0, 
      equipamentos: 0, 
      consumacao: 0, 
      pagamentoMusicos: 0, 
      outrosCustos: 0 
    })];

    const result = calculateDRE(simpleShows, [], []);

    expect(result.resultadoOperacional).toBe(1000);
    expect(result.margemFinal).toBe(100);
  });
});

describe("calculateProjectProgress", () => {
  it("should calculate progress percentage correctly", () => {
    const project: Project = {
      id: "1",
      name: "Test Project",
      description: "Test",
      totalValue: 10000,
      savedValue: 5000,
    };

    const result = calculateProjectProgress(project);

    expect(result.progressPercentual).toBe(50);
  });

  it("should determine if goal was reached", () => {
    const completedProject: Project = {
      id: "1",
      name: "Completed",
      description: "Test",
      totalValue: 1000,
      savedValue: 1000,
    };

    const result = calculateProjectProgress(completedProject);

    expect(result.metaAlcancada).toBe(true);
  });

  it("should calculate weeks to complete with weekly deposit", () => {
    const project: Project = {
      id: "1",
      name: "Test",
      description: "Test",
      totalValue: 1000,
      savedValue: 500,
      weeklyDeposit: 100,
    };

    const result = calculateProjectProgress(project);

    expect(result.weeksToComplete).toBe(5); // 500 remaining / 100 per week
  });

  it("should handle zero total value", () => {
    const project: Project = {
      id: "1",
      name: "Test",
      description: "Test",
      totalValue: 0,
      savedValue: 0,
    };

    const result = calculateProjectProgress(project);

    expect(result.progressPercentual).toBe(0);
  });
});

describe("calculateMonthlyProjection", () => {
  it("should calculate projected revenue based on average", () => {
    const shows = [
      createMockShow({ cache: 1000 }),
      createMockShow({ cache: 1500 }),
      createMockShow({ cache: 2000 }),
    ];

    const result = calculateMonthlyProjection(shows);

    // Average: 4500/3 = 1500, with 10% growth = 1650
    expect(result.faturamentoProjetado).toBeCloseTo(1650);
  });

  it("should handle empty shows array", () => {
    const result = calculateMonthlyProjection([]);

    expect(result.faturamentoProjetado).toBe(0);
  });
});

describe("formatCurrency", () => {
  it("should format positive values correctly", () => {
    const result = formatCurrency(1234.56);

    expect(result).toContain("1.234,56");
    expect(result).toContain("R$");
  });

  it("should format negative values correctly", () => {
    const result = formatCurrency(-500);

    expect(result).toContain("500");
  });

  it("should handle zero", () => {
    const result = formatCurrency(0);

    expect(result).toContain("0,00");
  });
});

describe("formatPercentage", () => {
  it("should format percentage with one decimal", () => {
    expect(formatPercentage(75.567)).toBe("75.6%");
  });

  it("should handle negative percentages", () => {
    expect(formatPercentage(-10.5)).toBe("-10.5%");
  });

  it("should handle zero", () => {
    expect(formatPercentage(0)).toBe("0.0%");
  });
});

describe("calculateShowDRE", () => {
  it("should return show DRE object with correct structure", () => {
    const show = createMockShow({
      id: "test-123",
      local: "Test Venue",
      date: "2024-12-15",
      cache: 1000,
    });

    const result = calculateShowDRE(show);

    expect(result).toHaveProperty("showId", "test-123");
    expect(result).toHaveProperty("titulo", "Test Venue");
    expect(result).toHaveProperty("data", "2024-12-15");
    expect(result).toHaveProperty("receita", 1000);
    expect(result).toHaveProperty("custo");
    expect(result).toHaveProperty("lucro");
    expect(result).toHaveProperty("margem");
  });
});

describe("getShowsAnalysis", () => {
  const mockShows = [
    createMockShow({ id: "1", local: "Venue A", cache: 1000, combustivel: 100 }),
    createMockShow({ id: "2", local: "Venue B", cache: 2000, combustivel: 200 }),
    createMockShow({ id: "3", local: "Venue C", cache: 500, combustivel: 50 }),
  ];

  it("should return analysis with all shows", () => {
    const result = getShowsAnalysis(mockShows);

    expect(result.items).toHaveLength(3);
  });

  it("should return top most profitable shows", () => {
    const result = getShowsAnalysis(mockShows);

    expect(result.topMost[0].receita).toBe(2000); // Venue B first
  });

  it("should return top least profitable shows", () => {
    const result = getShowsAnalysis(mockShows);

    expect(result.topLeast[0].receita).toBe(500); // Venue C first
  });

  it("should filter by date range", () => {
    const shows = [
      createMockShow({ id: "1", date: "2024-12-01" }),
      createMockShow({ id: "2", date: "2024-12-15" }),
      createMockShow({ id: "3", date: "2024-12-30" }),
    ];

    const result = getShowsAnalysis(shows, "2024-12-10", "2024-12-20");

    expect(result.items).toHaveLength(1);
    expect(result.items[0].data).toBe("2024-12-15");
  });

  it("should return chart data", () => {
    const result = getShowsAnalysis(mockShows);

    expect(result.chartData).toHaveLength(3);
    expect(result.chartData[0]).toHaveProperty("name");
    expect(result.chartData[0]).toHaveProperty("receita");
    expect(result.chartData[0]).toHaveProperty("custo");
  });
});
