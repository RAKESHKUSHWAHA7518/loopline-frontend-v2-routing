import { useState } from "react";
import { Dialog } from "./Dialog";
import { signupUser, AuthError } from "../lib/auth";
import { createUserDocument } from "../lib/firestore";
import { createUserInFirebase, setupMonthlyPlanPayment } from "../lib/customer";
import { ChevronLeft } from "lucide-react";
import { plans } from "../lib/plans";

interface SignupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export function SignupDialog({
  isOpen,
  onClose,
  onSwitchToLogin,
}: SignupDialogProps) {
  const [step, setStep] = useState<"details" | "plan">("details");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [customerId, setCustomerId] = useState<string>("");

  const handleNext = async () => {
    if (!name || !email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const user = await signupUser(email, password);

      await createUserDocument({
        uid: user.uid,
        email: user.email ?? "",
        name,
        createdAt: new Date(),
      });

      const customerIdResponse = await createUserInFirebase(
        user.email ?? "",
        user.uid,
      );

      setCurrentUser(user);
      setCustomerId(customerIdResponse || "");
      setStep("plan");
    } catch (err) {
      const authError = err as AuthError;
      setError(
        authError.code === "auth/email-already-in-use"
          ? "Email already in use"
          : authError.code === "auth/weak-password"
            ? "Password should be at least 6 characters"
            : "An error occurred. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteSignup = async () => {
    if (!selectedPlan) {
      setError("Please select a plan to continue");
      return;
    }

    if (!currentUser || !customerId) {
      setError("Something went wrong. Please try again.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await setupMonthlyPlanPayment(
        currentUser.uid,
        selectedPlan,
        customerId,
        currentUser.email || "",
      );
      onClose();
    } catch (error) {
      console.error("Error setting up payment:", error);
      setError("Failed to setup payment. Please try again.");
      setLoading(false);
    }
  };

  const handlePlanSelect = (productId: string) => {
    setSelectedPlan(productId);
    setError("");
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      maxWidth={step === "details" ? "max-w-md" : "max-w-4xl"}
      title={step === "details" ? "Sign Up" : "Choose your plan"}
    >
      {step === "details" ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleNext();
          }}
          className="flex flex-col gap-4"
        >
          {error && (
            <div className="bg-red-50 text-red-600 p-2 rounded-md text-xs">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-xs mb-1.5">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-[#64646533] rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs outline-none"
              placeholder="Enter your name"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-xs mb-1.5">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-[#64646533] rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs outline-none"
              placeholder="Enter your email"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs mb-1.5">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-[#64646533] rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs outline-none"
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#155EEF] text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || !name || !email || !password}
          >
            {loading ? "Creating account..." : "Next"}
          </button>

          <div className="text-center text-xs text-gray-600">
            Already have an account?{" "}
            <button
              type="button"
              className="text-blue-600 hover:text-blue-700 font-medium"
              onClick={onSwitchToLogin}
              disabled={loading}
            >
              Login
            </button>
          </div>
        </form>
      ) : (
        <div className="flex flex-col gap-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-2 rounded-md text-xs">
              {error}
            </div>
          )}

          <div className="grid grid-cols-3 gap-5">
            {plans.map((plan, idx) => {
              const isSelected = selectedPlan === plan.productId;
              const isEven = idx % 2 === 0;

              return (
                <div
                  key={plan.name}
                  className={`px-8 py-6 rounded-3xl flex flex-col gap-4 border cursor-pointer transition-all border hover:border-blue-400 ${
                    isSelected ? "shadow-xl" : "hover:shadow-md"
                  }`}
                  style={{
                    backgroundColor: isEven ? "#155EEF" : "#101214",
                    opacity: isSelected ? 1 : 0.4,
                  }}
                  onClick={() => handlePlanSelect(plan.productId)}
                >
                  <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                  <hr className="border-white" style={{ borderWidth: "1px" }} />
                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-bold text-white">Price</p>
                    <div className="text-4xl font-bold flex gap-1 items-end text-white">
                      ${plan.price}
                      <span className="text-sm font-normal mb-1 text-white">
                        /
                      </span>
                      <span className="text-sm font-normal mb-1 text-white">
                        month
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="relative w-full flex justify-center px-16">
            <button
              className="flex items-center text-[#155EEF] text-xs font-medium absolute left-0 otop-1/2 translate-y-1/2"
              onClick={() => setStep("details")}
              disabled={loading}
            >
              <ChevronLeft size={16} />
              Back
            </button>
            <button
              type="button"
              onClick={handleCompleteSignup}
              disabled={!selectedPlan || loading}
              className="flex-1 bg-[#155EEF] text-white py-2 px-4 max-w-80 mx-auto rounded-md hover:bg-blue-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : "Complete Signup"}
            </button>
          </div>
        </div>
      )}
    </Dialog>
  );
}
