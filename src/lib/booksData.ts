import type { Book } from "@/types";

export const defaultBooks: Book[] = [
  {
    id: '1',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    coverUrl: 'https://www.gutenberg.org/cache/epub/1342/pg1342.cover.medium.jpg',
    progress: 0,
    rating: 4,
    tags: ['Classic', 'Romance', 'Fiction'],
    isAudiobook: false,
    content: `PRIDE AND PREJUDICE

By Jane Austen


Chapter 1

It is a truth universally acknowledged, that a single man in possession
of a good fortune, must be in want of a wife.

However little known the feelings or views of such a man may be on his
first entering a neighbourhood, this truth is so well fixed in the minds
of the surrounding families, that he is considered the rightful property
of some one or other of their daughters.

"My dear Mr. Bennet," said his lady to him one day, "have you heard that
Netherfield Park is let at last?"

Mr. Bennet replied that he had not.

"But it is," returned she; "for Mrs. Long has just been here, and she
told me all about it."

Mr. Bennet made no answer.

"Do you not want to know who has taken it?" cried his wife impatiently.

"YOU want to tell me, and I have no objection to hearing it."

This was invitation enough.

[Content continues for several chapters...]`,
    contentUrl: 'https://www.gutenberg.org/ebooks/1342.txt.utf-8',
    currentPage: 0,
    totalPages: 432
  },
  {
    id: '2',
    title: 'Moby Dick',
    author: 'Herman Melville',
    coverUrl: 'https://www.gutenberg.org/cache/epub/2701/pg2701.cover.medium.jpg',
    progress: 0,
    rating: 4,
    tags: ['Classic', 'Adventure', 'Fiction'],
    isAudiobook: false,
    content: `MOBY DICK

By Herman Melville


CHAPTER 1. Loomings.

Call me Ishmael. Some years ago—never mind how long precisely—having
little or no money in my purse, and nothing particular to interest me
on shore, I thought I would sail about a little and see the watery part
of the world. It is a way I have of driving off the spleen and
regulating the circulation. Whenever I find myself growing grim about
the mouth; whenever it is a damp, drizzly November in my soul; whenever
I find myself involuntarily pausing before coffin warehouses, and
bringing up the rear of every funeral I meet; and especially whenever
my hypos get such an upper hand of me, that it requires a strong moral
principle to prevent me from deliberately stepping into the street, and
methodically knocking people's hats off—then, I account it high time to
get to sea as soon as I can. This is my substitute for pistol and ball.

[Content continues for several chapters...]`,
    contentUrl: 'https://www.gutenberg.org/ebooks/2701.txt.utf-8',
    currentPage: 0,
    totalPages: 635
  },
  {
    id: '3',
    title: 'The Adventures of Sherlock Holmes',
    author: 'Arthur Conan Doyle',
    coverUrl: 'https://www.gutenberg.org/cache/epub/1661/pg1661.cover.medium.jpg',
    progress: 0,
    rating: 5,
    tags: ['Mystery', 'Detective', 'Short Stories'],
    isAudiobook: false,
    content: `ADVENTURES OF SHERLOCK HOLMES

by SIR ARTHUR CONAN DOYLE


ADVENTURE I. A SCANDAL IN BOHEMIA

I.

To Sherlock Holmes she is always THE woman. I have seldom heard him
mention her under any other name. In his eyes she eclipses and
predominates the whole of her sex. It was not that he felt any emotion
akin to love for Irene Adler. All emotions, and that one particularly,
were abhorrent to his cold, precise but admirably balanced mind. He
was, I take it, the most perfect reasoning and observing machine that
the world has seen, but as a lover he would have placed himself in a
false position. He never spoke of the softer passions, save with a gibe
and a sneer. They were admirable things for the observer--excellent for
drawing the veil from men's motives and actions. But for the trained
reasoner to admit such intrusions into his own delicate and finely
adjusted temperament was to introduce a distracting factor which might
throw a doubt upon all his mental results. Grit in a sensitive
instrument, or a crack in one of his own high-power lenses, would not
be more disturbing than a strong emotion in a nature such as his. And
yet there was but one woman to him, and that woman was the late Irene
Adler, of dubious and questionable memory.

[Content continues for several stories...]`,
    contentUrl: 'https://www.gutenberg.org/ebooks/1661.txt.utf-8',
    currentPage: 0,
    totalPages: 307
  },
  {
    id: '4',
    title: 'Alice\'s Adventures in Wonderland',
    author: 'Lewis Carroll',
    coverUrl: 'https://www.gutenberg.org/cache/epub/11/pg11.cover.medium.jpg',
    progress: 0,
    rating: 4,
    tags: ['Fantasy', 'Children', 'Classic'],
    isAudiobook: true,
    content: '',
    audioSrc: 'https://archive.org/download/alices_adventures_in_wonderland_librivox/alicesadventuresinwonderland_01_carroll.mp3',
    readTimeMinutes: 0
  },
  {
    id: '5',
    title: 'The Raven',
    author: 'Edgar Allan Poe',
    coverUrl: 'https://www.gutenberg.org/cache/epub/17192/pg17192.cover.medium.jpg',
    progress: 0,
    rating: 5,
    tags: ['Poetry', 'Horror', 'Short'],
    isAudiobook: true,
    content: `THE RAVEN

by Edgar Allan Poe


Once upon a midnight dreary, while I pondered, weak and weary,
Over many a quaint and curious volume of forgotten lore—
    While I nodded, nearly napping, suddenly there came a tapping,
As of some one gently rapping, rapping at my chamber door.
"'Tis some visitor," I muttered, "tapping at my chamber door—
            Only this and nothing more."

    Ah, distinctly I remember it was in the bleak December;
And each separate dying ember wrought its ghost upon the floor.
    Eagerly I wished the morrow;—vainly I had sought to borrow
    From my books surcease of sorrow—sorrow for the lost Lenore—
For the rare and radiant maiden whom the angels name Lenore—
            Nameless here for evermore.

[Full poem continues...]`,
    audioSrc: 'https://archive.org/download/raven_poe_librivox/raven_poe.mp3',
    readTimeMinutes: 0
  }
];