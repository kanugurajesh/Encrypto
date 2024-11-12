"use client";

import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Copy, RefreshCw, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PasswordGenerator() {
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [length, setLength] = useState([12]);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    excludeSimilar: false,
  });

  const similarCharacters = ["I", "l", "1", "O", "0"];
  const charSets = {
    uppercase: "ABCDEFGHJKLMNPQRSTUVWXYZ",
    lowercase: "abcdefghijkmnopqrstuvwxyz",
    numbers: "23456789",
    symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
  };

  const generatePassword = () => {
    if (!Object.values(options).some((opt) => opt === true && opt !== options.excludeSimilar)) {
      toast({
        title: "Error",
        description: "Please select at least one character type",
        variant: "destructive",
      });
      return;
    }

    let chars = "";
    let result = "";

    // Add character sets based on options
    if (options.uppercase) chars += charSets.uppercase;
    if (options.lowercase) chars += charSets.lowercase;
    if (options.numbers) chars += charSets.numbers;
    if (options.symbols) chars += charSets.symbols;

    // Remove similar characters if option is selected
    if (options.excludeSimilar) {
      similarCharacters.forEach((char) => {
        chars = chars.replace(char, "");
      });
    }

    // Generate password
    for (let i = 0; i < length[0]; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Ensure at least one character from each selected type
    let finalPassword = result;
    if (options.uppercase) finalPassword = ensureCharType(finalPassword, charSets.uppercase);
    if (options.lowercase) finalPassword = ensureCharType(finalPassword, charSets.lowercase);
    if (options.numbers) finalPassword = ensureCharType(finalPassword, charSets.numbers);
    if (options.symbols) finalPassword = ensureCharType(finalPassword, charSets.symbols);

    setPassword(finalPassword);
  };

  const ensureCharType = (pwd: string, charSet: string) => {
    if (!pwd.split("").some((char) => charSet.includes(char))) {
      const pos = Math.floor(Math.random() * pwd.length);
      const char = charSet.charAt(Math.floor(Math.random() * charSet.length));
      return pwd.substring(0, pos) + char + pwd.substring(pos + 1);
    }
    return pwd;
  };

  const copyToClipboard = async () => {
    if (!password) return;
    await navigator.clipboard.writeText(password);
    toast({
      title: "Copied!",
      description: "Password copied to clipboard",
    });
  };

  const getPasswordStrength = () => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 12) strength += 1;
    if (password.match(/[A-Z]/)) strength += 1;
    if (password.match(/[a-z]/)) strength += 1;
    if (password.match(/[0-9]/)) strength += 1;
    if (password.match(/[^A-Za-z0-9]/)) strength += 1;
    return strength;
  };

  const strengthLabels = ["Very Weak", "Weak", "Medium", "Strong", "Very Strong"];
  const strengthColors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-green-500",
    "bg-emerald-500",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Shield className="w-12 h-12 mx-auto text-primary mb-4" />
          <h1 className="text-3xl font-bold text-white">Password Generator</h1>
          <p className="text-gray-400 mt-2">Create strong, secure passwords instantly</p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-gray-700">
          <div className="relative">
            <input
              type="text"
              value={password}
              readOnly
              className="w-full bg-gray-900 text-white px-4 py-3 rounded-lg font-mono text-lg"
              placeholder="Your password will appear here"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={copyToClipboard}
                disabled={!password}
                className="hover:bg-gray-700"
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={generatePassword}
                className="hover:bg-gray-700"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {password && (
            <div className="mt-4">
              <div className="flex gap-1 h-1.5">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex-1 rounded-full transition-all",
                      i < getPasswordStrength() ? strengthColors[getPasswordStrength() - 1] : "bg-gray-700"
                    )}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-400 mt-2 text-center">
                Strength: {strengthLabels[getPasswordStrength() - 1]}
              </p>
            </div>
          )}

          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-300">Password Length: {length[0]}</label>
              <Slider
                value={length}
                onValueChange={setLength}
                max={32}
                min={8}
                step={1}
                className="py-4"
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm text-gray-300">Character Types</label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(options)
                  .filter(([key]) => key !== "excludeSimilar")
                  .map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox
                        id={key}
                        checked={value}
                        onCheckedChange={(checked) =>
                          setOptions((prev) => ({ ...prev, [key]: checked === true }))
                        }
                      />
                      <label
                        htmlFor={key}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-300"
                      >
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </label>
                    </div>
                  ))}
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <Checkbox
                  id="excludeSimilar"
                  checked={options.excludeSimilar}
                  onCheckedChange={(checked) =>
                    setOptions((prev) => ({ ...prev, excludeSimilar: checked === true }))
                  }
                />
                <label
                  htmlFor="excludeSimilar"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-300"
                >
                  Exclude Similar Characters (I, l, 1, O, 0)
                </label>
              </div>
            </div>

            <Button
              className="w-full bg-primary hover:bg-primary/90"
              size="lg"
              onClick={generatePassword}
            >
              Generate Password
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}