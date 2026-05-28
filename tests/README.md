## Testing (Enterprise Layout)

Folder ini sengaja dipisah untuk:
- Unit / integration / security / error-handling tests (Jest)
- E2E tests (Playwright)
- Performance smoke (Autocannon-like minimal runner)
- Laporan (folder `reports/`) dan coverage (`coverage/`)

### Quick start

```bash
npm i
npm run test:unit
```

### Outputs

- `reports/`: junit + security/perf checks output
- `coverage/`: coverage report

