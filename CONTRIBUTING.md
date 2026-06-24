# Contributing to PathToCPA

Thanks for your interest! This project aims to help accounting students, and contributions —
especially keeping the rules accurate and adding more states — are very welcome.

## Getting set up

```bash
npm install
npm run dev      # http://localhost:3000
npm run test     # run the test suite
npm run lint     # lint
```

No database is needed for development — the app runs local-first.

## Ground rules

- **Keep the domain engines pure and tested.** Logic in `src/lib/eligibility`,
  `src/lib/journey`, `src/lib/costs`, and `src/lib/import` should be free of UI/DB code and
  covered by tests in the matching `*.test.ts` file.
- **Don't hardcode requirements in components.** Rules live in `src/lib/rules/`. If a rule
  changes, update the ruleset and its `lastVerified` date.
- **Accuracy over guessing.** This is a planning aid, not official advice. If you're unsure
  about a requirement, cite the source (e.g. the CBA) in your PR and reflect any known
  simplifications in the ruleset `notes`.
- **Run `npm run build` and `npm run test`** before opening a PR.

## Updating the California rules

Edit [`src/lib/rules/california.ts`](src/lib/rules/california.ts):

- Update the unit thresholds and/or `notes`.
- Bump `lastVerified` to the date you checked against the official source.
- Add/adjust tests in `src/lib/eligibility/evaluate.test.ts` if behavior changes.

## Adding a new state

The engines are state-agnostic (they take a `RuleSet` parameter), so:

1. Create `src/lib/rules/<state>.ts` implementing the `RuleSet` interface.
2. Add a cost template under `src/lib/costs/` for that state.
3. (UI) Allow selecting a state in the profile and pass the chosen ruleset into `evaluate`
   and `computeJourney`.

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the big picture.

## Commit & PR style

- Small, focused commits with clear messages.
- Describe **what** changed and **why** in the PR, and link any official sources for rule
  changes.

## License

By contributing, you agree your contributions are licensed under the [MIT License](LICENSE).
