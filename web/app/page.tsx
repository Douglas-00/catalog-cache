export const dynamic = 'force-dynamic';

interface Product {
  id: string;
  name: string;
  priceCents: number;
}

interface Lookup {
  product: Product;
  cache: string;
}

async function lookup(id: string, attempt: number): Promise<Lookup> {
  const base = process.env.API_URL ?? 'http://localhost:3000';
  // Next.js memorizes identical fetch calls during one render. The query keeps the two reads independent.
  const response = await fetch(`${base}/products/${id}?attempt=${attempt}`, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('Falha ao consultar o produto');
  }
  const product = (await response.json()) as Product;
  return { product, cache: response.headers.get('x-cache') ?? 'desconhecido' };
}

function formatPrice(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default async function Page() {
  const first = await lookup('caderno', 1);
  const second = await lookup('caderno', 2);

  return (
    <main>
      <p className="eyebrow">catalog-cache</p>
      <h1>A segunda leitura não vai ao cadastro</h1>
      <p className="lead">
        A página consulta o mesmo produto duas vezes. A primeira preenche o Redis por 30 segundos. A segunda reaproveita
        essa entrada.
      </p>
      <ol>
        {[first, second].map((item, index) => (
          <li key={index}>
            <strong>
              {item.product.name} · {formatPrice(item.product.priceCents)}
            </strong>
            <span>{item.cache}</span>
          </li>
        ))}
      </ol>
    </main>
  );
}
