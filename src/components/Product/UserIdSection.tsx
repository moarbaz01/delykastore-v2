import Label from "./Label";

interface UserIdSectionProps {
  game: string;
  isApi?: boolean;
  userId: string;
  zoneId: string;
  message: string;
  errorMessage: string;
  loading: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setZoneId: (value: string) => void;
  handleSubmitCheckRole: (e: React.SyntheticEvent<HTMLButtonElement>) => void;
}

const inputClass =
  "rounded-xl w-full text-white placeholder:text-gray-500 focus:outline-none py-2.5 px-4 text-sm transition-all duration-200 autofill:text-white";

const inputStyle = {
  background: "#0D0B1A",
  border: "1px solid rgba(168,85,247,0.2)",
};

const inputFocusStyle = {
  outline: "none",
  borderColor: "rgba(168,85,247,0.6)",
  boxShadow: "0 0 0 3px rgba(168,85,247,0.1)",
};

const UserIdSection = ({
  game,
  isApi,
  userId,
  zoneId,
  message,
  errorMessage,
  loading,
  handleInputChange,
  setZoneId,
  handleSubmitCheckRole,
}: UserIdSectionProps) => {
  return (
    <div
      className="p-4 rounded-2xl relative"
      style={{ background: "#12102A", border: "1px solid rgba(168,85,247,0.15)" }}
    >
      <Label text={"បញ្ចូល អាយឌី"} number={1} />
      <form className="flex flex-col gap-3 mt-4">
        <input
          type="text"
          placeholder="User ID"
          onChange={handleInputChange}
          value={userId}
          name="userId"
          autoComplete="on"
          className={inputClass}
          style={inputStyle}
          onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
          onBlur={(e) => Object.assign(e.target.style, inputStyle)}
        />

        {["mobilelegends", "magicchess"].includes(game) && (
          <input
            type="text"
            placeholder="SERVER ID"
            onChange={handleInputChange}
            value={zoneId}
            name="zoneId"
            autoComplete="on"
            className={inputClass}
            style={inputStyle}
            onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
            onBlur={(e) => Object.assign(e.target.style, inputStyle)}
          />
        )}

        {game === "genshinimpact" && (
          <select
            onChange={(e) => setZoneId(e.target.value)}
            value={zoneId}
            name="zoneId"
            className="rounded-xl w-full text-white text-sm py-2.5 px-4 transition-all duration-200 focus:outline-none"
            style={inputStyle}
          >
            <option value="" style={{ background: "#1A1730" }}>Select Server</option>
            <option value="Asia" style={{ background: "#1A1730" }}>Asia</option>
            <option value="America" style={{ background: "#1A1730" }}>America</option>
            <option value="Europe" style={{ background: "#1A1730" }}>Europe</option>
            <option value="TH, HK, MO" style={{ background: "#1A1730" }}>TH, HK, MO</option>
          </select>
        )}

        {message &&
          (game === "magicchess" ? (
            <p className="text-red-400 rounded-xl text-sm p-2.5 my-1"
              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
              {message}
            </p>
          ) : (
            <p className="text-purple-300 rounded-xl text-sm p-2.5 my-1"
              style={{ background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.2)" }}>
              USERNAME : {message}
            </p>
          ))}

        {errorMessage && (
          <p className="text-red-400 rounded-xl text-sm p-2.5 my-1"
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
            {errorMessage}
          </p>
        )}

        {(isApi || [
          "mobilelegends",
          "magicchess",
          "genshinimpact",
          "pubg",
          "freefire",
          "honorofkings",
          "bloodstrike",
        ].includes(game)) && (
          <button
            type="submit"
            onClick={handleSubmitCheckRole}
            disabled={loading}
            className="w-full md:w-auto md:mx-auto px-8 py-2.5 rounded-full text-white text-sm font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg, #7B2FBE 0%, #A855F7 100%)" }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Loading...
              </span>
            ) : (
              "ពិនិត្យ ឈ្មោះ"
            )}
          </button>
        )}
      </form>
    </div>
  );
};

export default UserIdSection;
