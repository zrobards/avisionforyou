import { Metadata } from "next";
import {
  openApiSpec,
  type OpenAPISpec,
} from "@/app/api/docs/openapi";

export const metadata: Metadata = {
  title: "API Documentation | A Vision For You",
  description:
    "Public API documentation for A Vision For You Inc. nonprofit organization.",
};

// ─── Helpers ───────────────────────────────────────────────────

const HTTP_METHOD_STYLES: Record<
  string,
  { bg: string; text: string; badge: string; label: string }
> = {
  get: {
    bg: "bg-green-50",
    text: "text-green-700",
    badge: "bg-green-600",
    label: "GET",
  },
  post: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    badge: "bg-blue-600",
    label: "POST",
  },
  put: {
    bg: "bg-orange-50",
    text: "text-orange-700",
    badge: "bg-orange-600",
    label: "PUT",
  },
  patch: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    badge: "bg-amber-600",
    label: "PATCH",
  },
  delete: {
    bg: "bg-red-50",
    text: "text-red-700",
    badge: "bg-red-600",
    label: "DELETE",
  },
};

/** Resolve a $ref string like "#/components/schemas/Foo" to the schema name */
function resolveRefName(ref: string): string {
  const parts = ref.split("/");
  return parts[parts.length - 1];
}

interface SchemaProperty {
  type?: string;
  format?: string;
  description?: string;
  example?: string | number | boolean | null;
  enum?: string[];
  nullable?: boolean;
  $ref?: string;
  items?: SchemaProperty;
  minimum?: number;
  maximum?: number;
  properties?: Record<string, SchemaProperty>;
  required?: string[];
  additionalProperties?: SchemaProperty | boolean;
}

interface SchemaDefinition {
  type: string;
  properties?: Record<string, SchemaProperty>;
  required?: string[];
  description?: string;
  additionalProperties?: SchemaProperty | boolean;
}

interface PathParameter {
  name: string;
  in: string;
  required: boolean;
  description: string;
  schema: SchemaProperty;
}

interface PathOperation {
  summary: string;
  description: string;
  tags: string[];
  operationId: string;
  parameters?: PathParameter[];
  requestBody?: {
    required: boolean;
    content: {
      "application/json": {
        schema: SchemaProperty;
      };
    };
  };
  responses: Record<
    string,
    {
      description: string;
      content?: Record<string, { schema: SchemaProperty }>;
      headers?: Record<string, { description: string; schema: SchemaProperty }>;
    }
  >;
}

/** Get all unique tags in order of first appearance */
function getOrderedTags(spec: OpenAPISpec): string[] {
  const seen = new Set<string>();
  const tags: string[] = [];
  for (const pathOps of Object.values(spec.paths)) {
    for (const op of Object.values(pathOps)) {
      const operation = op as PathOperation;
      for (const tag of operation.tags) {
        if (!seen.has(tag)) {
          seen.add(tag);
          tags.push(tag);
        }
      }
    }
  }
  return tags;
}

/** Group path operations by tag */
function getEndpointsByTag(
  spec: OpenAPISpec
): Map<string, Array<{ path: string; method: string; operation: PathOperation }>> {
  const map = new Map<
    string,
    Array<{ path: string; method: string; operation: PathOperation }>
  >();
  for (const [path, methods] of Object.entries(spec.paths)) {
    for (const [method, op] of Object.entries(methods)) {
      const operation = op as PathOperation;
      const tag = operation.tags[0] || "Other";
      if (!map.has(tag)) map.set(tag, []);
      map.get(tag)!.push({ path, method, operation });
    }
  }
  return map;
}

// ─── Sub-Components ────────────────────────────────────────────

function SchemaTable({
  schemaRef,
  schemas,
  requiredFields,
}: {
  schemaRef: string;
  schemas: Record<string, SchemaDefinition>;
  requiredFields?: string[];
}) {
  const schemaName = resolveRefName(schemaRef);
  const schema = schemas[schemaName] as SchemaDefinition | undefined;
  if (!schema?.properties) return null;

  const required = new Set(requiredFields ?? schema.required ?? []);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-2 pr-4 font-semibold text-gray-700">
              Field
            </th>
            <th className="text-left py-2 pr-4 font-semibold text-gray-700">
              Type
            </th>
            <th className="text-left py-2 font-semibold text-gray-700">
              Description
            </th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(schema.properties).map(([field, prop]) => {
            const p = prop as SchemaProperty;
            const isRequired = required.has(field);
            let typeLabel = p.type || "";
            if (p.format) typeLabel += ` (${p.format})`;
            if (p.$ref) typeLabel = resolveRefName(p.$ref);
            if (p.enum) typeLabel = p.enum.join(" | ");
            if (p.items?.$ref) typeLabel = `${resolveRefName(p.items.$ref)}[]`;
            if (p.nullable) typeLabel += " | null";

            return (
              <tr key={field} className="border-b border-gray-100">
                <td className="py-2 pr-4">
                  <code className="text-sm font-mono text-purple-700">
                    {field}
                  </code>
                  {isRequired && (
                    <span className="ml-1 text-xs text-red-500 font-semibold">
                      *
                    </span>
                  )}
                </td>
                <td className="py-2 pr-4">
                  <span className="text-xs font-mono text-gray-500">
                    {typeLabel}
                  </span>
                </td>
                <td className="py-2 text-gray-600">
                  {p.description || ""}
                  {p.example !== undefined && p.example !== null && (
                    <span className="ml-2 text-xs text-gray-400">
                      e.g. <code className="font-mono">{String(p.example)}</code>
                    </span>
                  )}
                  {p.minimum !== undefined && (
                    <span className="ml-2 text-xs text-gray-400">
                      min: {p.minimum}
                    </span>
                  )}
                  {p.maximum !== undefined && (
                    <span className="ml-2 text-xs text-gray-400">
                      max: {p.maximum}
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ParametersList({ parameters }: { parameters: PathParameter[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-2 pr-4 font-semibold text-gray-700">
              Parameter
            </th>
            <th className="text-left py-2 pr-4 font-semibold text-gray-700">
              In
            </th>
            <th className="text-left py-2 pr-4 font-semibold text-gray-700">
              Type
            </th>
            <th className="text-left py-2 font-semibold text-gray-700">
              Description
            </th>
          </tr>
        </thead>
        <tbody>
          {parameters.map((param) => (
            <tr key={param.name} className="border-b border-gray-100">
              <td className="py-2 pr-4">
                <code className="text-sm font-mono text-purple-700">
                  {param.name}
                </code>
                {param.required && (
                  <span className="ml-1 text-xs text-red-500 font-semibold">
                    *
                  </span>
                )}
              </td>
              <td className="py-2 pr-4">
                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded font-mono">
                  {param.in}
                </span>
              </td>
              <td className="py-2 pr-4">
                <span className="text-xs font-mono text-gray-500">
                  {param.schema.type}
                  {param.schema.format ? ` (${param.schema.format})` : ""}
                  {param.schema.enum ? ` [${param.schema.enum.join(", ")}]` : ""}
                </span>
              </td>
              <td className="py-2 text-gray-600">{param.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ResponseList({
  responses,
}: {
  responses: PathOperation["responses"];
  schemas: Record<string, SchemaDefinition>;
}) {
  const statusColors: Record<string, string> = {
    "2": "bg-green-100 text-green-800",
    "3": "bg-yellow-100 text-yellow-800",
    "4": "bg-orange-100 text-orange-800",
    "5": "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-2">
      {Object.entries(responses).map(([status, resp]) => {
        const colorKey = status.charAt(0);
        const colorClass = statusColors[colorKey] || "bg-gray-100 text-gray-800";
        const jsonContent = resp.content?.["application/json"];
        const schemaRef = jsonContent?.schema?.$ref;
        const isArray = jsonContent?.schema?.type === "array";
        const arrayItemRef = isArray ? jsonContent?.schema?.items?.$ref : null;
        const displayRef = schemaRef || arrayItemRef;

        return (
          <div key={status} className="flex items-start gap-3">
            <span
              className={`inline-block text-xs font-bold px-2 py-0.5 rounded ${colorClass} min-w-[3rem] text-center`}
            >
              {status}
            </span>
            <div>
              <span className="text-sm text-gray-700">{resp.description}</span>
              {displayRef && (
                <span className="ml-2 text-xs font-mono text-gray-400">
                  {isArray ? "[" : ""}
                  {resolveRefName(displayRef)}
                  {isArray ? "]" : ""}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function EndpointCard({
  path,
  method,
  operation,
  schemas,
}: {
  path: string;
  method: string;
  operation: PathOperation;
  schemas: Record<string, SchemaDefinition>;
}) {
  const style = HTTP_METHOD_STYLES[method] || HTTP_METHOD_STYLES.get;
  const requestBodyRef =
    operation.requestBody?.content?.["application/json"]?.schema?.$ref;

  return (
    <div
      id={operation.operationId}
      className={`rounded-lg border border-gray-200 overflow-hidden ${style.bg}`}
    >
      {/* Header */}
      <div className="px-5 py-4 flex items-center gap-3 bg-white/60 border-b border-gray-200">
        <span
          className={`inline-block text-xs font-bold text-white px-3 py-1 rounded ${style.badge} uppercase tracking-wide`}
        >
          {style.label}
        </span>
        <code className="text-sm font-mono font-semibold text-gray-800">
          /api{path}
        </code>
      </div>

      {/* Body */}
      <div className="px-5 py-4 bg-white space-y-5">
        {/* Summary & Description */}
        <div>
          <h4 className="text-base font-semibold text-gray-900">
            {operation.summary}
          </h4>
          <p className="mt-1 text-sm text-gray-600 leading-relaxed">
            {operation.description}
          </p>
        </div>

        {/* Parameters */}
        {operation.parameters && operation.parameters.length > 0 && (
          <div>
            <h5 className="text-sm font-semibold text-gray-800 mb-2">
              Parameters
            </h5>
            <ParametersList parameters={operation.parameters} />
          </div>
        )}

        {/* Request Body */}
        {requestBodyRef && (
          <div>
            <h5 className="text-sm font-semibold text-gray-800 mb-2">
              Request Body
              {operation.requestBody?.required && (
                <span className="ml-2 text-xs text-red-500 font-normal">
                  required
                </span>
              )}
            </h5>
            <div className="bg-gray-50 rounded-md p-3">
              <p className="text-xs font-mono text-gray-400 mb-2">
                {resolveRefName(requestBodyRef)}
              </p>
              <SchemaTable schemaRef={requestBodyRef} schemas={schemas} />
            </div>
          </div>
        )}

        {/* Responses */}
        <div>
          <h5 className="text-sm font-semibold text-gray-800 mb-2">
            Responses
          </h5>
          <ResponseList responses={operation.responses} schemas={schemas} />
        </div>
      </div>
    </div>
  );
}

// ─── Main Page Component ───────────────────────────────────────

export default function ApiDocsPage() {
  const spec = openApiSpec;
  const tags = getOrderedTags(spec);
  const endpointsByTag = getEndpointsByTag(spec);
  const schemas = spec.components.schemas as Record<string, SchemaDefinition>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <header className="bg-gradient-to-br from-[#7f3d8b] to-[#5a2d62] text-white">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
              <span className="text-[#b6e41f] font-bold text-lg">{"{}"}</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              {spec.info.title}
            </h1>
            <span className="ml-2 bg-white/20 text-xs font-mono px-2 py-1 rounded">
              v{spec.info.version}
            </span>
          </div>
          <p className="text-white/80 max-w-2xl leading-relaxed text-sm">
            {spec.info.description}
          </p>
          <div className="mt-6 flex items-center gap-6 text-xs text-white/60">
            <span>
              Base URL:{" "}
              <code className="bg-white/10 px-2 py-0.5 rounded font-mono">
                {spec.servers[0].url}
              </code>
            </span>
            <span>
              OpenAPI{" "}
              <code className="bg-white/10 px-2 py-0.5 rounded font-mono">
                {spec.openapi}
              </code>
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <nav className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-8">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Endpoints
              </h3>
              <ul className="space-y-1">
                {tags.map((tag) => {
                  const endpoints = endpointsByTag.get(tag) || [];
                  return (
                    <li key={tag}>
                      <p className="text-sm font-semibold text-[#7f3d8b] mt-4 mb-1">
                        {tag}
                      </p>
                      <ul className="space-y-0.5">
                        {endpoints.map(({ method, operation }) => {
                          const methodStyle =
                            HTTP_METHOD_STYLES[method] ||
                            HTTP_METHOD_STYLES.get;
                          return (
                            <li key={operation.operationId}>
                              <a
                                href={`#${operation.operationId}`}
                                className="flex items-center gap-2 py-1 px-2 rounded text-xs text-gray-600 hover:bg-purple-50 hover:text-[#7f3d8b] transition-colors"
                              >
                                <span
                                  className={`w-10 text-center font-bold text-[10px] uppercase ${methodStyle.text}`}
                                >
                                  {method.toUpperCase()}
                                </span>
                                <span className="truncate">
                                  {operation.summary}
                                </span>
                              </a>
                            </li>
                          );
                        })}
                      </ul>
                    </li>
                  );
                })}
              </ul>

              {/* Schema list */}
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-8 mb-3">
                Schemas
              </h3>
              <ul className="space-y-0.5">
                {Object.keys(schemas).map((name) => (
                  <li key={name}>
                    <a
                      href={`#schema-${name}`}
                      className="block py-1 px-2 rounded text-xs text-gray-500 font-mono hover:bg-purple-50 hover:text-[#7f3d8b] transition-colors truncate"
                    >
                      {name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Endpoint Sections */}
            {tags.map((tag) => {
              const endpoints = endpointsByTag.get(tag) || [];
              return (
                <section key={tag} className="mb-12">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-[#7f3d8b]/20">
                    {tag}
                  </h2>
                  <div className="space-y-6">
                    {endpoints.map(({ path, method, operation }) => (
                      <EndpointCard
                        key={operation.operationId}
                        path={path}
                        method={method}
                        operation={operation}
                        schemas={schemas}
                      />
                    ))}
                  </div>
                </section>
              );
            })}

            {/* Schemas Reference */}
            <section className="mb-12">
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-[#7f3d8b]/20">
                Schema Reference
              </h2>
              <div className="space-y-6">
                {Object.entries(schemas).map(([name, schema]) => {
                  const s = schema as SchemaDefinition;
                  if (!s.properties) return null;
                  return (
                    <div
                      key={name}
                      id={`schema-${name}`}
                      className="rounded-lg border border-gray-200 bg-white overflow-hidden"
                    >
                      <div className="px-5 py-3 border-b border-gray-200 bg-gray-50 flex items-center gap-3">
                        <code className="text-sm font-mono font-semibold text-[#7f3d8b]">
                          {name}
                        </code>
                        {s.description && (
                          <span className="text-xs text-gray-400">
                            {s.description}
                          </span>
                        )}
                      </div>
                      <div className="px-5 py-3">
                        <SchemaTable
                          schemaRef={`#/components/schemas/${name}`}
                          schemas={schemas}
                          requiredFields={s.required}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Footer Info */}
            <footer className="mt-16 border-t border-gray-200 pt-8 pb-12 text-center">
              <p className="text-sm text-gray-500">
                A Vision For You Inc. | 501(c)(3) Nonprofit
              </p>
              <p className="text-xs text-gray-400 mt-1">
                1675 Story Ave, Louisville, KY 40206 | (502) 749-6344 |{" "}
                <a
                  href="mailto:info@avisionforyourecovery.org"
                  className="text-[#7f3d8b] hover:underline"
                >
                  info@avisionforyourecovery.org
                </a>
              </p>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}
