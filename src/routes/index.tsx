import { createEffect, createMemo, createSignal, For, onMount } from 'solid-js';
import paragraphs from '~/lib/paragraphs';

export default function Home() {
  const [text, setText] = createSignal<string[]>();
  const [time, setTime] = createSignal<number>(0);
  const [startTimer, setStartTimer] = createSignal<boolean>(true);
  const [wordCount, setWordCount] = createSignal<number>(0);
  const [timer, setTimer] = createSignal<ReturnType<typeof setInterval>>();

  let textArea: HTMLTextAreaElement | undefined;
  let timeRef: HTMLHeadingElement | undefined;
  let wordsRef: HTMLHeadingElement | undefined;
  let wpmRef: HTMLHeadingElement | undefined;

  const calcWPM = (t, w) => {
    let wpm = (w / t) * 60;
    if (isNaN(wpm)) return '0';
    else return Math.round(wpm).toString();
  };
  const wpm = createMemo<string>(() => calcWPM(time(), wordCount()));

  // Initialize text with 3 random paragraphs.
  setText([...Array(3)].map(() => paragraphs[randInt(0, paragraphs.length - 1)]));

  onMount(() => {
    textArea.addEventListener('paste', () => window.location.reload());
    textArea.addEventListener('input', () => {
      /*
      if it's the start of a paragraph
      start an interval that updates the time by .01
      run every 100 ms
      also indicate the time has been started.
      */
      if (startTimer()) {
        setTime(0);
        setWordCount(0);
        setStartTimer(false);
        const interval = setInterval(() => {
          setTime(time() + 0.1);
        }, 100);
        setTimer(interval);
      }
      const current = textArea.value.split(' ');

      // highlight text
      findAndInsert(current.join(' '));

      // If the textbox value is equal to the paragraph, stop the timer.
      if (textArea.value === text()[0]) {
        clearInterval(timer());
        setStartTimer(true);
        textArea.value = '';
        findAndInsert('');
        const [_, ...rest] = text();
        const p = paragraphs[randInt(0, paragraphs.length - 1)];
        setText([...rest, p]);
      }

      // for each word in the text box
      // check if it is equal to the first paragraphs word
      // if not, that index is the word count
      current.forEach((word, i) => {
        if (word !== text()[0].split(' ')[i]) return setWordCount(i);
      });
    });
  });
  return (
    <>
      <h1>How fast can you type?</h1>
      <header>
        <div class='sideby'>
          {/* bind the time and word count */}
          <h2 ref={timeRef}>Time: {time().toFixed(1)}</h2>
          <h2 ref={wordsRef}>Words: {wordCount()}</h2>
        </div>
        <div class='alone'>
          {/* bind the WPM */}
          <h2 ref={wpmRef}>WPM: {wpm()}</h2>
        </div>
      </header>
      <main>
        <textarea ref={textArea} />
        {/* map the text strings into <p> elements */}
        <For each={text()}>{paragraph => <p>{paragraph}</p>}</For>
      </main>
    </>
  );
}

// randint util function
function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// Add <mark>'s to text in the paragraphs that matches the string.
// Remove <mark>'s when updating.
function findAndInsert(text: string) {
  const removeRegex = /(?:<mark>)(.+?)(?:<\/mark>)/gm;
  const elements = document.querySelectorAll('p');
  elements.forEach(elem => {
    elem.innerHTML = elem.innerHTML.replace(removeRegex, '$1');
    elem.innerHTML = elem.innerText.replaceAll(text, '<mark>' + text + '</mark>');
  });
}
