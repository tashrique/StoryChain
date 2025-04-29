export default function Header() {
  return (
    <header className="py-6 text-center">
      <h1 className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
        StoryChain
      </h1>
      <p className="mt-2 text-lg text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
        Add your line to our collaborative story, one line at a time.
      </p>
    </header>
  );
}
