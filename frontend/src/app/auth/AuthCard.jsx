const AuthCard = ({ title, headline, children }) => (
  <div className="card w-full max-w-lg bg-base-100 shadow-xl mx-auto">
    <div className="card-body p-8 sm:p-10">
      <div className="text-center mb-4">
        <h2 className="text-4xl font-extrabold text-primary">{title}</h2>
        <h4 className="text-l font-bold text-white pt-4">{headline}</h4>
      </div>
      <div className="text-white">{children}</div>
    </div>
  </div>
);

export default AuthCard;
