// add classes to ake final rendered html nicer to look at
export function prettifyHTML(htmlString: string): string {
  // Remove backslashes from the entire HTML string
  htmlString = htmlString.replace(/\\/g, "");
  htmlString = htmlString.replace(/^"(.*)"$/, "$1");
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");

  // Add classes to specific elements
  const h1Element = doc.querySelectorAll("h1");
  h1Element.forEach((heading) => {
    const classes =
      "text-4xl w-5/6 text-center font-semibold text-slate-300 p-3".split(" ");
    classes.forEach((c) => {
      heading.classList.add(c);
    });
  });

  const h2Element = doc.querySelectorAll("h2");
  h2Element.forEach((heading) => {
    const classes =
      "text-2xl w-5/6 text-center font-semibold text-slate-300 p-3".split(" ");
    classes.forEach((c) => {
      heading.classList.add(c);
    });
  });

  const paragraphElements = doc.querySelectorAll("p");
  paragraphElements.forEach((paragraph) => {
    const classes = "text-wrap w-5/6 text-pretty text-lg".split(" ");
    classes.forEach((c) => {
      paragraph.classList.add(c);
    });
  });
  const quotes = doc.querySelectorAll("blockquote");
  quotes.forEach((quote) => {
    const classes =
      "italic text-lg w-5/6 text-slate-400 border-l-8 my-2 border-slate-600 inline-flex items-center bg-slate-800 rounded-md p-4".split(
        " "
      );
    classes.forEach((c) => {
      quote.classList.add(c);
    });
  });

  const atag = doc.querySelectorAll("a");
  atag.forEach((a) => {
    const classes =
      "text-slate-300 italic font-semibold underline text-blue-500 hover:text-blue-400 transition-all".split(
        " "
      );
    classes.forEach((c) => {
      a.classList.add(c);
    });
  });

  // TODO:: figure out why NuxtLink gets rendered as nuxtlink on the browser
  const modifiedHtml = doc.body.innerHTML.replaceAll(
    /<a(.*?)>(.*?)<\/a>/g,
    (match, attributes, content) => {
      const decodedAttributes = decodeURIComponent(attributes);
      return `<NuxtLink${decodedAttributes}>${content}</NuxtLink>`;
    }
  );

  // Replace href with to, removing backslashes and double quotes
  const finalHtml = modifiedHtml.replaceAll(
    /href="(.*?)"/g,
    (match, hrefValue) => {
      const cleanedHrefValue = decodeURIComponent(
        hrefValue.replace(/\\|"/g, "")
      );
      return `to="${cleanedHrefValue}"`;
    }
  );

  return finalHtml;
}
