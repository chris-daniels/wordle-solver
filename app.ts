import { promises as fs } from 'fs';

// Each guess has a result where tiles have a color: gray, green, and yellow
type TileColor = 'x' | 'g' | 'y'; // gray (x), green, yellow
function isOfTileColor(keyInput: string): keyInput is TileColor {
    return ['x', 'g', 'y'].includes(keyInput);
}

// A guess result is an array of 5 tile colors
export type GuessResult = TileColor[];

// Filter an array of possible words based on a guess result
export function filterGuesses(guessResult: GuessResult, currentGuess: string, possibleWords: string[]) {
    const filteredWords = possibleWords.filter((possible) => {
        // Look at the greens first - if a result tile was green and the possible word doesn't match the guess at that position, throw it out.
        // What if we see a green, and then we see a yellow tile later with this character? Then it means the possible word should have the character at a position OTHER than the green position. 
        // What if we see a gray later with this character AGAIN? It means we should NOT have this character anymore.
        // So after we assess a tile, I think we should remove the character from the possible word so greens don't impact yellows, and yellows don't impact gray tiles.

        // So first scan guess result for greens. 
        for (let i = 0; i < guessResult.length; i++) {
            if (guessResult[i] === 'g') {
                if (possible[i] !== currentGuess[i]) {
                    return false;
                } else {
                    possible = possible.replace(possible[i], '*');
                }
            }
        }

        // Then the yellows - if a result tile is yellow and the possible word doesn't have that character from the guess, throw it out.
        // If we find the character, take it out of the possible word so it won't impact future yellows or grays.
        for (let i = 0; i < guessResult.length; i++) {
            if (guessResult[i] === 'y') {
                if (!possible.includes(currentGuess[i])) {
                    return false;
                } else {
                    possible = possible.replace(currentGuess[i], '*');
                }
            }
        }
        // Now the gray tiles - if a result tile is gray, that character should NOT be in the possible word at this point/
        for (let i = 0; i < guessResult.length; i++) {
            if (guessResult[i] === 'x') {
                if (possible.includes(currentGuess[i])) {
                    return false;
                }
            }
        }
        return true;
    });

    return filteredWords;
}

// Model game board as a class
// Holds onto an array of possible words, and method calls will filter and make new guesses. 
class GameBoard {
    private guessesWithResult: Map<string, GuessResult> = new Map();
    private currentGuess: string;
    private possibleWords: string[];
    private allWords: string[];
    constructor(words: string[]) {
        this.possibleWords = words;
        this.allWords = words;
    }

    // Ask gameboard for a guess based on the possible words remaining
    public makeGuess(): string {
        // Some logging. See what words we're choosing from
        console.log(`There are ${this.possibleWords.length} possible words remaining. Making a guess...`);
        console.log(this.possibleWords);

        // Assume each possible word has an equal probability.
        // Given a particular solution, each guess will eliminate some number of words.
        // So, for each possible guess, we can generate an "expected number of possible words remaining after guess."
        // We choose the guess with the SMALLEST expected number of possible words after guess
        const expectedPossibleWordsAfterGuess = new Map<string, number>();
        const numberOfPossibleWords = this.possibleWords.length;

        // Loop through each possible word, assume it's the solution
        for (const assumedSolutionWord of this.possibleWords) {
            // Examine each guess and put it in the expected value map
            for (const guess of this.allWords) {
                const guessResult = this.getGuessResultGivenGuessAndSolution(guess, assumedSolutionWord);
                const possibleWordsAfterGuess = filterGuesses(guessResult, guess, this.possibleWords);
                const expectedValueContribution = possibleWordsAfterGuess.length / numberOfPossibleWords;
                const currentExpectedValue = expectedPossibleWordsAfterGuess.get(guess) ?? 0;
                expectedPossibleWordsAfterGuess.set(guess, currentExpectedValue + expectedValueContribution);
            }
        }

        // Get sorted array of expected values
        let guessCandidates = Array.from(expectedPossibleWordsAfterGuess).sort(([, v1], [, v2]) => v1 - v2);

        // Consider all "ties" for first to be guess candidates
        const maxScore = guessCandidates[0][1];
        guessCandidates = guessCandidates.filter((ev) => ev[1] === maxScore);

        // If there is more than one valid candidate, guess the one that's a possible word
        if(guessCandidates.length > 1){
            guessCandidates = guessCandidates.filter((ev) => this.possibleWords.includes(ev[0]));
        }

        console.log(`Guess candidates: ${guessCandidates}`);
        this.currentGuess = guessCandidates[0][0];
        return guessCandidates[0][0];
    }

    // Try to mimic Wordle's guess result logic. We use this when calculating expected values of a guess. 
    // Take a guess and solution, and return a GuessResult
    private getGuessResultGivenGuessAndSolution(guess: string, solution: string) {
        let guessResult: GuessResult = ['x', 'x', 'x', 'x', 'x'];

        // Get the greens - replace with * so we don't factor them into the yellows
        for (let i = 0; i < 5; i++) {
            if (solution[i] === guess[i]) {
                guessResult[i] = 'g';
                solution = solution.replace(guess[i], '*');
            }
        }
        // Get the yellows - if not green, see if solution contains the letter we're looking at
        // Replace with * so we only allow each character in solution to map to one "yellow"
        for (let i = 0; i < 5; i++) {
            if (guessResult[i] !== 'g' && solution.includes(guess[i])) {
                guessResult[i] = 'y';
                solution = solution.replace(guess[i], '*');
            }
        }
        return guessResult;
    }

    // Filter down the possible words based on colored tile input
    public computeGuessResult(result: string) {
        if (result.length !== 5) {
            throw new Error('invalid guess result length');
        }
        const guessResult: GuessResult = [];
        for (let i = 0; i < result.length; i++) {
            const c = result[i];
            if (isOfTileColor(c)) {
                guessResult.push(c);
            } else {
                throw new Error('invalid tile colors');
            }
        }

        this.guessesWithResult.set(this.currentGuess, guessResult);
        this.filterGuessesFromGameBoard(guessResult);
    }

    private filterGuessesFromGameBoard(guessResult: GuessResult) {
        this.possibleWords = filterGuesses(guessResult, this.currentGuess, this.possibleWords);
    }

    // Remove a possible word that wordle told us doesn't work
    public removeBadWord() {
        this.possibleWords = this.possibleWords.filter((possible) => possible !== this.currentGuess);
    }

    public setCurrentGuess(currentGuess: string) {
        this.currentGuess = currentGuess;
    }
}

const app = async () => {
    // Get the possible answer set from file
    const wordsListData = await fs.readFile('words_list.txt');
    const possibleWords = wordsListData.toString().replace(/\r\n/g, '\n').split('\n');

    // Initialize the GameBoard
    const gameBoard = new GameBoard(possibleWords);

    // First guess was taking a long time, but it will be constant. Manually set that here. 
    gameBoard.setCurrentGuess('raise');
    console.log(`Guess: ${'raise'}. Give me a result (example: xygxg):`);

    // Initialize reading the guess results listener
    var stdin = process.openStdin();
    stdin.addListener('data', function (d) {
        const guessResult = d.toString().trim();

        if (guessResult === 'x') {
            // Allow removing a word that Wordle won't accept. 
            gameBoard.removeBadWord();
        } else {
            // Filter results based ona guess result. 
            gameBoard.computeGuessResult(guessResult);
        }
        console.log(`Guess: ${gameBoard.makeGuess()}. Give me a result (example: xygxg):`);
    });
};

app();
