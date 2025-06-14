import React, { useState, useEffect } from "react";
import { CustomFunctionSchema } from "../../pages/UpdateAgent";

interface CustomFunctionProps {
  parameters?: CustomFunctionSchema;
  setParameters: (params: CustomFunctionSchema) => void;
  setIsError: (isError: boolean) => void;
}

const CustomFunction: React.FC<CustomFunctionProps> = ({
  parameters,
  setParameters,
  setIsError,
}) => {
  // Store schema as string for input
  const [inputSchema, setInputSchema] = useState<string>(
    parameters
      ? JSON.stringify(parameters, null, 2)
      : `{\n  "type": "object",\n  "properties": {}, \n  "required": []}`,
  );

  const [errors, setErrors] = useState<string[]>([]); // Track validation errors

  // Validate schema on input change
  useEffect(() => {
    const validationErrors = validateUserSchemaInput(inputSchema);
    setErrors(validationErrors);

    // If valid, update parent state
    if (validationErrors.length === 0) {
      const parsed = JSON.parse(inputSchema);
      setParameters(parsed); // Send valid schema to parent
    }
  }, [inputSchema]);

  useEffect(() => {
    if (errors && errors.length > 0) {
      setIsError(true);
    } else {
      setIsError(false);
    }
  }, [errors]);

  function validateCustomFunctionSchema(
    schema: any,
    path: string = "root",
  ): string[] {
    const errors: string[] = [];
    if (
      typeof schema !== "object" ||
      schema === null ||
      Array.isArray(schema)
    ) {
      errors.push(`Schema at ${path} should be an object`);
      return errors;
    }
    if (!("type" in schema)) {
      errors.push(`Missing "type" at ${path}`);
    } else if (typeof schema.type !== "string" || schema.type.trim() === "") {
      errors.push(`Invalid "type" at ${path}: must be a non-empty string`);
    } else if (
      !["object", "string", "number", "boolean", "array"].includes(schema.type)
    ) {
      errors.push(`Unsupported "type" at ${path}: ${schema.type}`);
    }
    if ("properties" in schema) {
      if (schema.type !== "object") {
        errors.push(
          `"properties" defined at ${path}, but "type" is not "object"`,
        );
      }
      if (
        typeof schema.properties !== "object" ||
        schema.properties === null ||
        Array.isArray(schema.properties)
      ) {
        errors.push(`"properties" at ${path} should be an object`);
      } else {
        for (const key in schema.properties) {
          if (key.trim() === "") {
            errors.push(`Empty property name at ${path}`);
          } else {
            errors.push(
              ...validateCustomFunctionSchema(
                schema.properties[key],
                `${path}.${key}`,
              ),
            );
          }
        }
      }
    }
    if ("required" in schema) {
      if (!Array.isArray(schema.required)) {
        errors.push(`"required" at ${path} should be an array`);
      } else if (
        !schema.required.every((r) => typeof r === "string" && r.trim() !== "")
      ) {
        errors.push(
          `"required" at ${path} should only contain non-empty strings`,
        );
      }
    }
    if ("enum" in schema && !Array.isArray(schema.enum)) {
      errors.push(`"enum" at ${path} should be an array`);
    }
    if (
      "format" in schema &&
      (typeof schema.format !== "string" || schema.format.trim() === "")
    ) {
      errors.push(`"format" at ${path} should be a non-empty string`);
    }
    return errors;
  }

  function isValidJSON(input: string): {
    valid: boolean;
    parsed?: any;
    error?: string;
  } {
    try {
      const parsed = JSON.parse(input);
      return { valid: true, parsed };
    } catch (e: any) {
      return { valid: false, error: e.message };
    }
  }

  function validateUserSchemaInput(input: string): string[] {
    const syntaxCheck = isValidJSON(input);
    if (!syntaxCheck.valid) {
      return [`Invalid JSON: ${syntaxCheck.error}`];
    }
    return validateCustomFunctionSchema(syntaxCheck.parsed);
  }

  return (
    <div>
      <label className="block text-xs font-medium  mb-1">
        Function JSON Schema
      </label>
      <textarea
        required
        value={inputSchema}
        onChange={(e) => setInputSchema(e.target.value)}
        className="w-full px-2.5 py-1.5 border bg-white dark:bg-[#141414] dark:border-white dark:text-white border-[#1012141A] rounded-[6px] appearance-none outline-none text-xs font-medium text-[#646465] h-40"
        placeholder="Enter JSON schema here..."
      />
      <button
        onClick={(e) => {
          e.preventDefault();
          const syntaxCheck = isValidJSON(inputSchema);
          if (syntaxCheck.valid && syntaxCheck.parsed) {
            const formatted = JSON.stringify(syntaxCheck.parsed, null, 2);
            setInputSchema(formatted);
          } else {
            setErrors([`Invalid JSON: ${syntaxCheck.error}`]);
          }
        }}
        className="border border-gray-400 hover:border-gray-600 bg-white mt-1 ml-auto text-gray-600 hover:text-gray-800 px-3 py-1 rounded-lg transition-colors flex items-center space-x-2 text-[10px] disabled:opacity-50 font-medium"
      >
        Format JSON
      </button>

      {errors.length > 0 && (
        <div className="text-red-500 text-xs mt-1">
          {errors.map((error, idx) => (
            <div key={idx}>{error}</div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomFunction;
