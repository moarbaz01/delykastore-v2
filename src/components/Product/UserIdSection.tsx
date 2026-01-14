import Label from "./Label";

interface UserIdSectionProps {
  game: string;
  userId: string;
  zoneId: string;
  message: string;
  errorMessage: string;
  loading: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setZoneId: (value: string) => void;
  handleSubmitCheckRole: (e: React.SyntheticEvent<HTMLButtonElement>) => void;
}

const UserIdSection = ({
  game,
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
    <div className="p-4 bg-secondary rounded-lg border border-gray-600 relative">
      <Label text={"បញ្ចូល អាយឌី"} number={1} />
      <form className="flex flex-col gap-4 mt-4">
        <input
          type="text"
          placeholder="User ID"
          onChange={handleInputChange}
          value={userId}
          name="userId"
          autoComplete="on"
          className="rounded-lg bg-card-bg w-full text-white placeholder:text-gray-400 focus:outline-primary focus:outline py-2 px-4 autofill:bg-card-bg autofill:text-white"
        />

        {["mobilelegends", "magicchess"].includes(game) && (
          <input
            type="text"
            placeholder="SERVER ID"
            onChange={handleInputChange}
            value={zoneId}
            name="zoneId"
            autoComplete="on"
            className="rounded-lg w-full placeholder:text-gray-400 bg-card-bg text-white focus:outline-primary focus:outline py-2 px-4 autofill:bg-card-bg autofill:text-white"
          />
        )}

        {game === "genshinimpact" && (
          <select
            onChange={(e) => setZoneId(e.target.value)}
            value={zoneId}
            name="zoneId"
            className="rounded-lg w-full placeholder:text-gray-400 bg-[#1a2332] border-2 text-white focus:outline-primary focus:outline border-[#3d4e60] py-2 px-4"
          >
            <option value="">Select Server</option>
            <option value="Asia">Asia</option>
            <option value="America">America</option>
            <option value="Europe">Europe</option>
            <option value="TH, HK, MO">TH, HK, MO</option>
          </select>
        )}

        {message &&
          (game === "magicchess" ? (
            <p className="text-red-500 rounded-lg font-bold bg-card-bg text-md p-2 my-1">
              {message}
            </p>
          ) : (
            <p className="text-primary rounded-lg bg-card-bg text-md p-2 my-1">
              USERNAME : {message}
            </p>
          ))}

        {errorMessage && (
          <p className="text-red-400 rounded-lg bg-card-bg text-md p-2 my-1">
            {errorMessage}
          </p>
        )}

        {[
          "mobilelegends",
          "magicchess",
          "genshinimpact",
          "pubg",
          "freefire",
          "honorofkings",
          "bloodstrike",
        ].includes(game) && (
            <button
              type="submit"
              onClick={handleSubmitCheckRole}
              disabled={loading}
              className="bg-primary w-full rounded-lg p-2 text-black md:w-fit md:mx-auto shadow-md font-bold"
            >
              {loading ? "Loading..." : "ពិនិត្យ ឈ្មោះ"}
            </button>
          )}
      </form>
    </div>
  );
};

export default UserIdSection;
