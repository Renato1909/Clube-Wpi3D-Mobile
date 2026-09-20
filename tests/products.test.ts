import { filterProducts,formatPrice,Product } from "../lib/products";
const products:Product[]=[{slug:"a",title:"Peça Azul",category:"Decoração",description:"modelo",image:"x",priceCents:1250},{slug:"b",title:"Estátua",category:"Arte",description:"religiosa",image:"y",priceCents:null}];
test("filters catalog by text and category",()=>{expect(filterProducts(products,"azul","")).toHaveLength(1);expect(filterProducts(products,"","Arte")).toHaveLength(1);});
test("formats BRL and undefined price",()=>{expect(formatPrice(1250)).toContain("12,50");expect(formatPrice(null)).toBe("Preço a definir");});
