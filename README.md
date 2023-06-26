# Worldle Solver

## About
Fooling around with a Wordle solver. Currently assists the user by making a guess and taking feedback manually via the command line. Given feedback, it will narrow down the possbile words and make a new guess. 

Seems to be working for some sample games, but it still needs more robust testing. Plenty to iterate on here. 

## Dependencies
The solver is written in Typescript. You can get started with setting up a Typescript environment here: https://www.typescripttutorial.net/typescript-tutorial/setup-typescript/ 

## To compile:
```tsc app.ts```

## To run:
```node app.js```

<details>
  <summary>Adding a sample console output to illustrate how to play.</summary>

```txt
$node app.js
Guess: raise. Give me a result (example: xygxg):
gxxxy
There are 26 possible words remaining. Making a guess...
[
  'rebel', 'rebut', 'recur',
  'recut', 'reedy', 'refer',
  'renew', 'repel', 'reply',
  'rerun', 'retch', 'retro',
  'retry', 'revel', 'revue',
  'rhyme', 'rodeo', 'roger',
  'rogue', 'rouge', 'route',
  'rover', 'rower', 'ruder',
  'ruler', 'rupee'
]
Guess candidates: clout,2.7307692307692304
Guess: clout. Give me a result (example: xygxg):
xxyxx
There are 4 possible words remaining. Making a guess...
[ 'rodeo', 'roger', 'rover', 'rower' ]
Guess candidates: wedge,1
Guess: wedge. Give me a result (example: xygxg):
xygxx
There are 1 possible words remaining. Making a guess...
[ 'rodeo' ]
Guess candidates: rodeo,1
Guess: rodeo. Give me a result (example: xygxg):
ggggg
There are 1 possible words remaining. Making a guess...
[ 'rodeo' ]
Guess candidates: rodeo,1
Guess: rodeo. Give me a result (example: xygxg):
```
</details>



## Next Steps
Stuff I want to do:
 - Clean up code a bit
 - End game handling. Right now we just continue guessing. 
 - Write tests, assess performance of all words in the answer set. 
 - Put a FE on here - experiment w/ scraping NY Times to automatically get a solution
 - Deploy to cloud