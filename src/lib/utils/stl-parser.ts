export interface STLAnalysis {
  volume: number; // in cubic mm (mm³)
  dimensions: {
    x: number; // width in mm
    y: number; // depth in mm
    z: number; // height in mm
  };
  triangleCount: number;
  thumbnail?: string;
}

interface Point3D {
  x: number;
  y: number;
  z: number;
}

/**
 * Calculates the signed volume of a single tetrahedron formed by the origin (0,0,0)
 * and the three vertices of a triangle.
 */
function signedVolumeOfTetrahedron(p1: Point3D, p2: Point3D, p3: Point3D): number {
  return (
    (p1.x * (p2.y * p3.z - p2.z * p3.y) +
     p1.y * (p2.z * p3.x - p2.x * p3.z) +
     p1.z * (p2.x * p3.y - p2.y * p3.x)) / 6.0
  );
}

/**
 * Parses an STL file (as an ArrayBuffer) and extracts dimensions, triangle count, and exact volume.
 * Supports both Binary and ASCII STL files.
 */
export function parseSTL(buffer: ArrayBuffer): STLAnalysis {
  // 1. Detect if it's ASCII or Binary
  const view = new DataView(buffer);
  
  // Read first 256 bytes (or total length if smaller) as string to detect "solid"
  const bytesToRead = Math.min(buffer.byteLength, 256);
  let initialText = "";
  for (let i = 0; i < bytesToRead; i++) {
    initialText += String.fromCharCode(view.getUint8(i));
  }
  
  const isAscii = initialText.trim().startsWith("solid") && 
                  (initialText.includes("facet") || initialText.includes("outer loop") || buffer.byteLength < 84);

  if (isAscii) {
    return parseAsciiSTL(initialText, buffer);
  } else {
    return parseBinarySTL(view, buffer);
  }
}

/**
 * High-speed parser for binary STL files.
 */
function parseBinarySTL(view: DataView, buffer: ArrayBuffer): STLAnalysis {
  if (buffer.byteLength < 84) {
    throw new Error("Binary STL file is too small to be valid.");
  }

  // The number of triangles is stored in bytes 80-83 (32-bit unsigned integer, little-endian)
  const triangleCount = view.getUint32(80, true);
  
  // Safety check on file size: each triangle is 50 bytes
  const expectedSize = 84 + triangleCount * 50;
  // Some STL files have extra trailing metadata; we just check if we have enough buffer length
  if (buffer.byteLength < expectedSize) {
    throw new Error(`Invalid Binary STL file size. Expected at least ${expectedSize} bytes, got ${buffer.byteLength}.`);
  }

  let totalVolume = 0;
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;

  let offset = 84;
  for (let i = 0; i < triangleCount; i++) {
    // Each triangle consists of:
    // - Normal vector (3x 32-bit float = 12 bytes) -> can be skipped for volume/bounds
    // - Vertex 1 (3x 32-bit float = 12 bytes)
    // - Vertex 2 (3x 32-bit float = 12 bytes)
    // - Vertex 3 (3x 32-bit float = 12 bytes)
    // - Attribute byte count (16-bit unsigned integer = 2 bytes)
    
    // Skip Normal vector
    offset += 12;

    const p1 = {
      x: view.getFloat32(offset, true),
      y: view.getFloat32(offset + 4, true),
      z: view.getFloat32(offset + 8, true),
    };
    offset += 12;

    const p2 = {
      x: view.getFloat32(offset, true),
      y: view.getFloat32(offset + 4, true),
      z: view.getFloat32(offset + 8, true),
    };
    offset += 12;

    const p3 = {
      x: view.getFloat32(offset, true),
      y: view.getFloat32(offset + 4, true),
      z: view.getFloat32(offset + 8, true),
    };
    offset += 12;

    // Skip Attribute byte count
    offset += 2;

    // Accumulate bounding box
    minX = Math.min(minX, p1.x, p2.x, p3.x);
    maxX = Math.max(maxX, p1.x, p2.x, p3.x);
    minY = Math.min(minY, p1.y, p2.y, p3.y);
    maxY = Math.max(maxY, p1.y, p2.y, p3.y);
    minZ = Math.min(minZ, p1.z, p2.z, p3.z);
    maxZ = Math.max(maxZ, p1.z, p2.z, p3.z);

    // Calculate signed tetrahedron volume
    totalVolume += signedVolumeOfTetrahedron(p1, p2, p3);
  }

  // Bounding box size
  const sizeX = minX === Infinity ? 0 : maxX - minX;
  const sizeY = minY === Infinity ? 0 : maxY - minY;
  const sizeZ = minZ === Infinity ? 0 : maxZ - minZ;

  return {
    volume: Math.abs(totalVolume), // Absolute value represents total volume
    dimensions: {
      x: Math.round(sizeX * 10) / 10,
      y: Math.round(sizeY * 10) / 10,
      z: Math.round(sizeZ * 10) / 10,
    },
    triangleCount,
  };
}

/**
 * Fallback parser for ASCII STL files. Handles line-by-line reading.
 */
function parseAsciiSTL(initialText: string, buffer: ArrayBuffer): STLAnalysis {
  // Read entire buffer as string
  const decoder = new TextDecoder("utf-8");
  const fullText = decoder.decode(buffer);
  
  let totalVolume = 0;
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;
  let triangleCount = 0;

  // Regex to extract vertices
  // Format typically is:
  // facet normal ni nj nk
  //   outer loop
  //     vertex v1x v1y v1z
  //     vertex v2x v2y v2z
  //     vertex v3x v3y v3z
  //   endloop
  // endfacet
  const vertexRegex = /vertex\s+(-?[\d.eE+-]+)\s+(-?[\d.eE+-]+)\s+(-?[\d.eE+-]+)/g;
  
  const vertices: Point3D[] = [];
  let match;

  while ((match = vertexRegex.exec(fullText)) !== null) {
    vertices.push({
      x: parseFloat(match[1]),
      y: parseFloat(match[2]),
      z: parseFloat(match[3]),
    });
  }

  triangleCount = Math.floor(vertices.length / 3);

  for (let i = 0; i < triangleCount; i++) {
    const p1 = vertices[i * 3];
    const p2 = vertices[i * 3 + 1];
    const p3 = vertices[i * 3 + 2];

    if (!p1 || !p2 || !p3) continue;

    // Accumulate bounding box
    minX = Math.min(minX, p1.x, p2.x, p3.x);
    maxX = Math.max(maxX, p1.x, p2.x, p3.x);
    minY = Math.min(minY, p1.y, p2.y, p3.y);
    maxY = Math.max(maxY, p1.y, p2.y, p3.y);
    minZ = Math.min(minZ, p1.z, p2.z, p3.z);
    maxZ = Math.max(maxZ, p1.z, p2.z, p3.z);

    // Calculate volume
    totalVolume += signedVolumeOfTetrahedron(p1, p2, p3);
  }

  const sizeX = minX === Infinity ? 0 : maxX - minX;
  const sizeY = minY === Infinity ? 0 : maxY - minY;
  const sizeZ = minZ === Infinity ? 0 : maxZ - minZ;

  return {
    volume: Math.abs(totalVolume),
    dimensions: {
      x: Math.round(sizeX * 10) / 10,
      y: Math.round(sizeY * 10) / 10,
      z: Math.round(sizeZ * 10) / 10,
    },
    triangleCount,
  };
}
