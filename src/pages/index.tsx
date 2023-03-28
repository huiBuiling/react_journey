import yayJpg from "../assets/yay.jpg";

import { Link } from "umi";

export default function HomePage() {
  const routes = [
    { name: "transformObj", url: "transformObj" },
    { name: "camera", url: "camera" },
    { name: "orbitControls", url: "orbitControls" },
    { name: "geometry", url: "geometry" },
    { name: "ligui", url: "ligui" },
    { name: "texture", url: "texture" },
    { name: "materials", url: "materials" },
    { name: "standardMaterial", url: "standardMaterial" },
    { name: "fontLoader", url: "fontLoader" },

    // light
    { name: "light", url: "light" },
    { name: "dlight", url: "dlight" },
    { name: "lightAnim", url: "lightAnim" },
    { name: "shadowBase", url: "shadowBase" },
    { name: "shadow", url: "shadow" },
    { name: "shadowsBaking", url: "shadowsBaking" },

    // demo
    // {
    //   name: "demo-3D TEXT",
    //   url: "3DText",
    // },
    { name: "hauntedHouse", url: "hauntedHouse" },
    { name: "mushroom", url: "mushroom" },
    { name: "editor", url: "editor" },
    { name: "girl", url: "girl" },
  ];
  return (
    <div>
      <p>
        <img src={yayJpg} width="388" />
      </p>
      <ul>
        {routes.map((item, index) => (
          <li key={index}>
            <Link to={item.url}>{item.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
