
interface Quote {
  text: string;
  author: string;
}

const quotes: Quote[] = [
  {
    text: "We don't see things as they are, we see them as we are.",
    author: "Anaïs Nin"
  },
  {
    text: "The unexamined life is not worth living.",
    author: "Socrates"
  },
  {
    text: "Happiness is not something ready-made. It comes from your own actions.",
    author: "Dalai Lama"
  },
  {
    text: "Be the change that you wish to see in the world.",
    author: "Mahatma Gandhi"
  },
  {
    text: "Life is what happens when you're busy making other plans.",
    author: "John Lennon"
  },
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs"
  },
  {
    text: "In three words I can sum up everything I've learned about life: it goes on.",
    author: "Robert Frost"
  },
  {
    text: "The purpose of our lives is to be happy.",
    author: "Dalai Lama"
  },
  {
    text: "You only live once, but if you do it right, once is enough.",
    author: "Mae West"
  },
  {
    text: "To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment.",
    author: "Ralph Waldo Emerson"
  }
];

export const getQuoteOfTheDay = (): Quote => {
  // Create a date string that changes once per day (year-month-day)
  const today = new Date();
  const dateString = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
  
  // Use the date string to generate a consistent index for today
  // This ensures the same quote shows all day, but changes each day
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    hash = ((hash << 5) - hash) + dateString.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Get a positive index within the range of our quotes array
  const index = Math.abs(hash) % quotes.length;
  return quotes[index];
};
