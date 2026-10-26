import { describe, expect, it } from 'vitest';
import { calculateMonthlyFinancials } from '@/lib/calculations';
import { mapsDirectionsUrl, NO_EMPLOYMENT_CLAUSE, buildReceiptHtml } from '@/lib/musicianReceipt';

describe('Cachês de músicos pagos', () => {
  it('cachê pago entra como custo do show, não como saída avulsa', () => {
    const m = calculateMonthlyFinancials([], [{ id: '1', origin: 'musician:abc', category: 'equipamentos', description: 'Cachê', amount: 300, date: '2026-10-10' }], [], [], new Date('2026-10-15T12:00:00'));
    expect(m.custosShows).toBe(300);
    expect(m.saidasAvulsas).toBe(0);
    expect(m.totalGastos).toBe(300);
  });
  it('Maps traça rota até o endereço', () => {
    expect(mapsDirectionsUrl('Rua A, 10')).toBe('https://www.google.com/maps/dir/?api=1&destination=Rua%20A%2C%2010');
  });
  it('recibo contém a cláusula sem vínculo empregatício', () => {
    const html = buildReceiptHtml({ id: 's', title: 'Show', date: '2026-10-10', time: '20:00', local: 'Bar', tipo: 'Bar', cache: 0, numMusicos: 1, consumacao: 0, kmRodados: 0, combustivel: 0, pedagio: 0, roupas: 0, equipamentos: 0, outrosCustos: 0, pagamentoMusicos: 0 }, { name: 'João', instrument: 'Baixo', cache: 250, paid: true }, { name: 'Ana' });
    expect(html).toContain(NO_EMPLOYMENT_CLAUSE);
  });
});
