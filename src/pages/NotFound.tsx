import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { CustomButton } from "@/components/ui/custom-button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <Layout hideFooter>
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <h1 className="text-8xl font-serif font-bold mb-6 bg-gradient-to-r from-lavender to-emerald bg-clip-text text-transparent">404</h1>
          <h2 className="text-2xl font-serif font-medium mb-4">Lost in Thought</h2>
          <p className="text-muted-foreground mb-8">
            The page you're looking for seems to have wandered off. Perhaps it's contemplating the meaning of existence somewhere else.
          </p>
          <CustomButton variant="accent" size="lg" onClick={() => window.location.href = "/"}>
            Return to the Café
          </CustomButton>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
