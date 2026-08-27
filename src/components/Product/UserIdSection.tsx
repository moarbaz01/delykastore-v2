import Label from "./Label";

interface UserIdSectionProps {
  game: string;
  isApi?: boolean;
  requiresServerId?: boolean;
  requiresUserId?: boolean;
  requiresCharName?: boolean;
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
  "rounded-xl w-full text-gray-800 placeholder:text-gray-600 focus:outline-none py-2.5 px-4 text-sm transition-all duration-200 autofill:text-gray-800";

const inputStyle = {
  background: "#FDFDFD",
  border: "1px solid rgba(255,117,151,0.2)",
};

const inputFocusStyle = {
  outline: "none",
  borderColor: "rgba(255,117,151,0.6)",
  boxShadow: "0 0 0 3px rgba(255,117,151,0.1)",
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
  requiresServerId,
  requiresUserId,
  requiresCharName,
}: UserIdSectionProps) => {
  const showServerId = requiresServerId !== undefined 
    ? requiresServerId 
    : (["mobilelegends", "magicchess", "genshinimpact"].includes(game.toLowerCase()) || game.toLowerCase().startsWith("mlbb"));
    
  const showUserId = requiresUserId !== undefined ? requiresUserId : true;

  return (
    <div
      className="p-4 rounded-2xl relative"
      style={{ background: "#FFFFFF", border: "1px solid rgba(255,117,151,0.15)" }}
    >
      <Label text={"Enter User ID"} number={1} />
      <form className="flex flex-col gap-3 mt-4">
        {showUserId && (
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
        )}

        {showServerId && (
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
            className="rounded-xl w-full text-gray-900 text-sm py-2.5 px-4 transition-all duration-200 focus:outline-none"
            style={inputStyle}
          >
            <option value="" style={{ background: "#FDFDFD" }}>Select Server</option>
            <option value="Asia" style={{ background: "#FDFDFD" }}>Asia</option>
            <option value="America" style={{ background: "#FDFDFD" }}>America</option>
            <option value="Europe" style={{ background: "#FDFDFD" }}>Europe</option>
            <option value="TH, HK, MO" style={{ background: "#FDFDFD" }}>TH, HK, MO</option>
          </select>
        )}

        {message &&
          (game === "magicchess" ? (
            <p className="text-red-500 rounded-xl text-sm p-2.5 my-1"
              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
              {message}
            </p>
          ) : (
            <div className="flex items-center justify-between rounded-xl p-3 my-1"
              style={{ background: "rgba(255,117,151,0.1)", border: "1px solid rgba(255,117,151,0.2)" }}>
              <span className="text-primary text-sm font-medium truncate pr-2">
                USERNAME: {message}
              </span>
              <span className="flex items-center gap-1 text-green-600 text-[10px] sm:text-xs font-bold px-2 py-1 rounded bg-green-500/10 border border-green-500/20 whitespace-nowrap">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
                VERIFIED
              </span>
            </div>
          ))}

        {errorMessage && (
          <p className="text-red-500 rounded-xl text-sm p-2.5 my-1"
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
            {errorMessage}
          </p>
        )}

        {loading && (
          <div className="flex items-center justify-center gap-2 text-primary text-sm mt-2">
            <div className="w-4 h-4 border-2 border-pink-500/30 border-t-pink-500 rounded-full animate-spin" />
            Checking Name...
          </div>
        )}
      </form>
    </div>
  );
};

export default UserIdSection;
