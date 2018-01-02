#schlanganger-event

## Build
..

## Test
npm run buildNtest
tsc -p tsconfig.commonjs.json -w
tsc -p tsconfig-test.json -w
npm test

tsc -p tsconfig.commonjs.json && tsc -p tsconfig-test.json && npm test