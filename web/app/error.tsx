'use client';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main>
      <h1>Não foi possível consultar o catálogo</h1>
      <p>{error.message}</p>
      <button type="button" onClick={reset}>
        Tentar de novo
      </button>
    </main>
  );
}
