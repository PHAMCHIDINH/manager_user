const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-slate-200 bg-white/90 py-6 text-center text-sm text-slate-500">
      <p className="mx-auto max-w-4xl">&copy; {year} My Project. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
