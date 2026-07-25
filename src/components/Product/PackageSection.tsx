import CostItem from "./CostItem";
import Label from "./Label";

interface PackageSectionProps {
  groupedCost: Array<{
    category: string;
    items: Array<{
      id: string;
      amount?: string;
      durationDays?: number;
      price: string;
      image?: string;
      note?: string;
      category?: string;
    }>;
  }>;
  amountSelected: {
    id: string;
    amount?: string;
    durationDays?: number;
    price: string;
  };
  setAmountSelected: (value: any) => void;
}

const PackageSection = ({
  groupedCost,
  amountSelected,
  setAmountSelected,
}: PackageSectionProps) => {
  return (
    <div
      className="p-4 rounded-2xl relative"
      style={{ background: "#12102A", border: "1px solid rgba(168,85,247,0.15)" }}
    >
      <Label text={"ជ្រើសរើសកញ្ចប់"} number={2} />
      {groupedCost.map((item, index) => (
        <div key={index} className="mt-4">
          {item.category !== "no_category" && item.items.length !== 0 && (
            <div className="flex items-center gap-2 mt-2 mb-3">
              <div className="h-px flex-1 bg-purple-500/10" />
              <h3
                className="font-bold text-sm px-3 py-1 rounded-full"
                style={{
                  background: "rgba(168,85,247,0.1)",
                  color: "#C084FC",
                  border: "1px solid rgba(168,85,247,0.2)",
                }}
              >
                {item.category}
              </h3>
              <div className="h-px flex-1 bg-purple-500/10" />
            </div>
          )}

          <div className="grid md:grid-cols-3 grid-cols-1 gap-3 md:gap-4 mt-2">
            {item.items.map((item, i) => (
              <CostItem
                key={item.id}
                item={item}
                i={i}
                amountSelected={amountSelected}
                setAmountSelected={setAmountSelected}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PackageSection;
