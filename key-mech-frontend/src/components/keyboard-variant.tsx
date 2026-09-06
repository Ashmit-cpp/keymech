import { useEffect, useMemo } from "react";
import * as THREE from "three";
import type { KeyboardRefs } from "./3d-keyboard";
import { buildVariantLayout, KEYCAP_GAP, SWITCH_PITCH as P, type KeyboardVariant } from "@/lib/keyboard-variants";
import type { GarageKeycapTheme } from "@/lib/garage-theme";

interface Props {
  layout: KeyboardVariant;
  nodes: Record<string, THREE.Mesh>;
  keycapMaterial: THREE.Material;
  keycapGeo: (geometry: THREE.BufferGeometry) => THREE.BufferGeometry;
  topCaseMaterial: THREE.Material;
  bottomCaseMaterial: THREE.Material;
  plateMaterial: THREE.Material;
  feetMaterial: THREE.Material;
  switchMaterials: THREE.Material[];
  theme?: GarageKeycapTheme;
  parts: Pick<KeyboardRefs, "plate" | "pcb" | "topCase" | "bottomCase" | "weight" | "keycapsRoot"> & { switches: KeyboardRefs["switches"]["numberRow"] };
}

function rectangle(x: number, y: number, width: number, height: number, radius: number) {
  const path = new THREE.Shape();
  path.moveTo(x + radius, y);
  path.lineTo(x + width - radius, y);
  path.quadraticCurveTo(x + width, y, x + width, y + radius);
  path.lineTo(x + width, y + height - radius);
  path.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  path.lineTo(x + radius, y + height);
  path.quadraticCurveTo(x, y + height, x, y + height - radius);
  path.lineTo(x, y + radius);
  path.quadraticCurveTo(x, y, x + radius, y);
  return path;
}

/** Extrude in the keyboard's X/Z plane, keeping the same physical thickness as the 75%. */
function extrude(shape: THREE.Shape, bottom: number, thickness: number, bevel = 0.0003) {
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: thickness, bevelEnabled: bevel > 0, bevelSize: bevel,
    bevelThickness: bevel, bevelSegments: 3, steps: 1, curveSegments: 8,
  });
  geometry.rotateX(Math.PI / 2);
  geometry.translate(0, bottom + thickness, 0);
  return geometry;
}

/** Retain the source cap's dish, skirt, bevels and UVs; extend wide caps through their center. */
function fitKeycap(source: THREE.BufferGeometry, units: number, heightUnits = 1) {
  const geometry = source.clone();
  geometry.computeBoundingBox();
  const box = geometry.boundingBox!;
  const center = box.getCenter(new THREE.Vector3());
  const delta = (units * P - KEYCAP_GAP - (box.max.x - box.min.x)) / 2;
  const depthDelta = (heightUnits * P - KEYCAP_GAP - (box.max.z - box.min.z)) / 2;
  const positions = geometry.getAttribute("position");
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i) - center.x;
    const z = positions.getZ(i) - center.z;
    positions.setXYZ(i, x + Math.sign(x) * delta, positions.getY(i) - box.min.y, z + Math.sign(z) * depthDelta);
  }
  positions.needsUpdate = true;
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
}

/** The legends absent from the original atlas get their own UV-matched tile. */
function legendMaterial(geometry: THREE.BufferGeometry, legend: string, base: THREE.Material, theme?: GarageKeycapTheme, role: "base" | "modifier" | "accent" = "modifier") {
  const material = (base as THREE.MeshStandardMaterial).clone();
  const canvas = document.createElement("canvas");
  geometry.computeBoundingBox();
  const box = geometry.boundingBox!;
  canvas.width = Math.round(256 * (box.max.x - box.min.x) / (P - KEYCAP_GAP));
  canvas.height = Math.round(256 * (box.max.z - box.min.z) / (P - KEYCAP_GAP));
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = theme?.[role] ?? "#373d48";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = (role === "modifier" ? theme?.secondaryLegend : theme?.primaryLegend) ?? "#ffffff";
  ctx.font = '600 42px Arial, sans-serif';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const lines = legend.split("\n");
  ctx.fillText(lines[0], canvas.width / 2, canvas.height / 2 - (lines.length > 1 ? 26 : 28));
  if (lines[1]) {
    ctx.font = '500 28px Arial, sans-serif';
    ctx.fillText(lines[1], canvas.width / 2, canvas.height / 2 + 30);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.flipY = false;
  texture.anisotropy = 8;
  // Planar coordinates keep the legend centered and unstretched on resized caps.
  // Skirts sample the blank tile edges; the sculpted dish retains its original normals.
  const uv = geometry.getAttribute("uv");
  const positions = geometry.getAttribute("position");
  for (let i = 0; i < uv.count; i++) uv.setXY(i,
    (positions.getX(i) - box.min.x) / (box.max.x - box.min.x),
    (positions.getZ(i) - box.min.z) / (box.max.z - box.min.z));
  material.map = texture;
  return material;
}

export function KeyboardVariantModel({ layout, nodes, keycapMaterial, keycapGeo, topCaseMaterial, bottomCaseMaterial, plateMaterial, feetMaterial, switchMaterials, theme, parts: { topCase: topCaseRef, bottomCase: bottomCaseRef, plate: plateRef, pcb: pcbRef, weight: weightRef, keycapsRoot: keycapsRef, switches: switchesRef } }: Props) {
  const model = useMemo(() => {
    const spec = buildVariantLayout(layout);
    const width = spec.width * P, depth = spec.height * P;
    const rim = 0.005;
    const x0 = -width / 2, z0 = -depth / 2;
    const shell = () => rectangle(x0 - rim, z0 - rim, width + rim * 2, depth + rim * 2, 0.002);
    const top = shell();
    for (const c of spec.clusters) {
      if (layout !== "60" && c.x >= 15.5 && c.x < 19 && c.y >= 4.5) continue;
      top.holes.push(rectangle(x0 + c.x * P + 0.0002, z0 + c.y * P + 0.0002, c.width * P - 0.0004, c.height * P - 0.0004, 0.0005));
    }
    if (layout !== "60") {
      // A single inverted-T opening avoids a thin case bridge between Up and Down.
      const arrows = new THREE.Path();
      const outline = [[16.5, 4.5], [17.5, 4.5], [17.5, 5.5], [18.5, 5.5], [18.5, 6.5], [15.5, 6.5], [15.5, 5.5], [16.5, 5.5]];
      outline.forEach(([x, z], i) => {
        if (i === 0) arrows.moveTo(x0 + x * P, z0 + z * P);
        else arrows.lineTo(x0 + x * P, z0 + z * P);
      });
      arrows.closePath();
      top.holes.push(arrows);
    }
    const plate = rectangle(x0 - 0.002, z0 - 0.002, width + 0.004, depth + 0.004, 0.001);
    const keys = spec.keys.map((key) => {
      const geometry = fitKeycap(keycapGeo(nodes[key.source].geometry), key.units, key.heightUnits);
      const x = x0 + (key.x + key.units / 2) * P;
      const z = z0 + (key.y + key.heightUnits / 2) * P;
      plate.holes.push(rectangle(x - 0.007, z - 0.007, 0.014, 0.014, 0.0003));
      return { ...key, geometry, x, z, material: key.legend ? legendMaterial(geometry, key.legend, keycapMaterial, theme, key.colorRole ?? (key.id === "backslash" ? "base" : "modifier")) : keycapMaterial };
    });
    const bottom = shell();
    bottom.holes.push(rectangle(x0 + 0.001, z0 + 0.001, width - 0.002, depth - 0.002, 0.001));
    return {
      keys, width, depth,
      top: extrude(top, 0.003, 0.011),
      bottom: extrude(bottom, -0.005, 0.007),
      floor: extrude(shell(), -0.006, 0.001),
      plate: extrude(plate, -0.0006, 0.0012, 0),
      pcb: extrude(rectangle(x0 - 0.001, z0 - 0.001, width + 0.002, depth + 0.002, 0.001), -0.003, 0.0016, 0),
      weight: extrude(rectangle(-width * 0.35, -depth * 0.25, width * 0.7, depth * 0.5, 0.002), -0.0068, 0.0008),
    };
  }, [layout, nodes, keycapGeo, keycapMaterial, theme]);

  useEffect(() => () => {
    model.keys.forEach((key) => {
      key.geometry.dispose();
      if (key.legend) {
        (key.material as THREE.MeshStandardMaterial).map?.dispose();
        key.material.dispose();
      }
    });
    [model.top, model.bottom, model.floor, model.plate, model.pcb, model.weight].forEach((g) => g.dispose());
  }, [model]);

  return <group>
    <mesh ref={topCaseRef} geometry={model.top} material={topCaseMaterial} position-y={-0.014} castShadow receiveShadow />
    <group ref={bottomCaseRef} position-y={-0.014}>
      <mesh geometry={model.bottom} material={bottomCaseMaterial} castShadow receiveShadow />
      <mesh geometry={model.floor} material={bottomCaseMaterial} castShadow receiveShadow />
      {[-1, 1].flatMap((x) => [-1, 1].map((z) => <mesh key={`${x}-${z}`} position={[x * (model.width / 2 - 0.012), -0.007, z * (model.depth / 2 - 0.01)]} material={feetMaterial}>
        <boxGeometry args={[0.024, 0.002, 0.006]} />
      </mesh>))}
    </group>
    <mesh ref={weightRef} geometry={model.weight} position-y={-0.014} castShadow>
      <meshStandardMaterial color="#807c6e" metalness={0.8} roughness={0.4} />
    </mesh>
    <mesh ref={plateRef} geometry={model.plate} material={plateMaterial} position-y={-0.006} castShadow receiveShadow />
    <mesh ref={pcbRef} geometry={model.pcb} material={plateMaterial} position-y={-0.009} castShadow receiveShadow />
    <group ref={switchesRef}>
      {model.keys.map((key) => <group key={key.id} position={[key.x, -0.002, key.z]}>
        {["Switch_Heavy002", "Switch_Heavy002_1", "Switch_Heavy002_2", "Switch_Heavy002_3"].map((name, i) => <mesh key={name} geometry={nodes[name].geometry} material={switchMaterials[i]} castShadow receiveShadow />)}
        {(key.units >= 2 || key.heightUnits >= 2) && [-1, 1].map((side) => <mesh key={side} position={[key.heightUnits >= 2 ? 0 : side * (key.units >= 6 ? 0.05 : 0.0119), -0.002, key.heightUnits >= 2 ? side * 0.0119 : 0]} material={feetMaterial}>
          <boxGeometry args={[0.004, 0.005, 0.007]} />
        </mesh>)}
      </group>)}
    </group>
    <group ref={keycapsRef}>
      {model.keys.map((key) => <mesh key={key.id} name={key.id} geometry={key.geometry} material={key.material} position={[key.x, 0, key.z]} castShadow receiveShadow />)}
    </group>
  </group>;
}
