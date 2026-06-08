# Backend Testing & Coverage Guide

Before running backend tests, ensure you have this installed:

- ReportGenerator (for readable coverage reports):
```bash
  dotnet tool install --global dotnet-reportgenerator-globaltool
```

---

## Running Tests

### Run tests only (w/o coverage report)
```bash
pnpm test:backend
```

### Run tests with coverage report
```bash
pnpm test:backend:coverage
```

## Viewing Coverage Report

After running testing with coverage, open human readable report at:
```
"./backend/CoverageReport/index.html"
```

## Codecov
### `TestResults/*.cobertura.xml`
This is the machine-readable coverage file generated during a coverage run. It is in the [Cobertura](https://cobertura.github.io/cobertura/) XML format, which is a standard coverage report format supported by most CI tools. This file is what gets uploaded to Codecov and is also used by **reportgenerator** to produce the human-readable HTML report.

## Troubleshooting

**reportgenerator not found**
```bash
dotnet tool install --global dotnet-reportgenerator-globaltool
```

**Tests not found / zero tests ran**
```bash
pnpm clean:backend
pnpm install:backend
pnpm test:backend:coverage
```