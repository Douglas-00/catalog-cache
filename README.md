# catalog-cache

API NestJS de catálogo com cache-aside no Redis. A página Next.js lê o mesmo produto duas vezes para mostrar a falta e o acerto de cache.

## Decisão

A fonte da verdade fica na aplicação. O Redis guarda a resposta por 30 segundos, na chave `catalog:product:{id}`. Uma alteração apaga essa chave, então a próxima leitura volta a origem e grava de novo. O cabeçalho `X-Cache` diz `HIT` ou `MISS`.

A lista de produtos não entra no cache. O exemplo concentra a política no recurso que a tela consulta de novo.

## Subir

```bash
docker compose up --build
```

A API fica em `http://localhost:3011` e a página em `http://localhost:3006`. O Redis fica só na rede do Compose, para não disputar a porta 6379 da máquina.

```bash
curl http://localhost:3011/products/caderno
curl -X PATCH http://localhost:3011/products/caderno \
  -H 'content-type: application/json' \
  -d '{"priceCents": 2700}'
```

O `PATCH` invalida a chave. A leitura seguinte responde `X-Cache: MISS` com o preço novo.

## Endpoints

| Método | Caminho | Efeito |
|---|---|---|
| GET | `/health` | Processo no ar |
| GET | `/products` | Lista, sem cache |
| GET | `/products/:id` | Cache-aside, cabeçalho `X-Cache` |
| PATCH | `/products/:id` | Atualiza e invalida a chave |

## Licença

MIT
