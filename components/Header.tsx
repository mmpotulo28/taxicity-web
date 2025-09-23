import { Button } from "@heroui/button";
import { Icon } from "@iconify/react";

const Header: React.FC = () => {
  return (
    <header className="flex items-center justify-between px-4 py-3 bg-transparent backdrop-blur-sm shadow-sm z-1">
      <div className="flex items-center gap-2">
        <Icon className="text-foreground text-2xl" icon="lucide:taxi" />
        <h1 className="text-xl font-semibold text-foreground">TaxiCity</h1>
      </div>
      <Button
        isIconOnly
        aria-label="User profile"
        className="text-foreground"
        variant="light"
      >
        <Icon className="text-xl" icon="lucide:user" />
      </Button>
    </header>
  );
};

export default Header;
