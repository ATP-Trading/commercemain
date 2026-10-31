import clsx from "clsx";
import Price from "./price";

const Label = ({
  title,
  amount,
  currencyCode,
  position = "bottom",
  isATPMember = false,
}: {
  title: string;
  amount: string;
  currencyCode: string;
  position?: "bottom" | "center";
  isATPMember?: boolean;
}) => {
  const [name, subtitle] = title.match(/^(.*?)\s+[–—-]\s+(.+)$/)?.slice(1) || [title];
  return (
    <div
      className={clsx(
        "absolute bottom-0 left-0 flex w-full px-3 pb-3 @container/label",
        {
          "lg:px-20 lg:pb-[35%]": position === "center",
        }
      )}
    >
      <div
        className={clsx(
          "flex flex-col gap-2 rounded-xl border p-3 text-xs font-semibold backdrop-blur-md transition-all duration-300 w-full max-w-full",
          {
            "bg-atp-gold/90 border-atp-gold text-atp-black": isATPMember,
            "bg-atp-white/95 border-atp-light-gray text-atp-black":
              !isATPMember,
          }
        )}
      >
        <div className="space-y-2">
          <h3 dir="auto" className="text-center leading-snug text-sm font-semibold">{name}</h3>
          {subtitle && <p dir="auto" className="text-xs font-normal leading-relaxed text-neutral-600">{subtitle}</p>}
        </div>
        <Price
          className={clsx(
            "self-start rounded-full px-3 py-1.5 text-white font-semibold text-xs",
            {
              "bg-atp-black": isATPMember,
              "bg-atp-charcoal": !isATPMember,
            }
          )}
          amount={amount}
          currencyCode={currencyCode}
          currencyCodeClassName="hidden @[275px]/label:inline"
        />
      </div>
    </div>
  );
};

export default Label;
