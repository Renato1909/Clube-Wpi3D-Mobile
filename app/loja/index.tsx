import { productImageSource } from "../../lib/product-images";
import { useEffect,useMemo,useState } from "react";
import { ActivityIndicator,FlatList,Image,Pressable,StyleSheet,Text,TextInput,View } from "react-native";
import { router } from "expo-router";
import { filterProducts,formatPrice,getProducts,Product } from "../../lib/products";

export default function Loja(){
 const [products,setProducts]=useState<Product[]>([]); const [query,setQuery]=useState(""); const [category,setCategory]=useState(""); const [loading,setLoading]=useState(true);
 const [error,setError]=useState(false); const [retry,setRetry]=useState(0);
 useEffect(()=>{let active=true;setLoading(true);setError(false);getProducts().then(value=>{if(active)setProducts(value)}).catch(()=>{if(active)setError(true)}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[retry]);
 const categories=useMemo(()=>Array.from(new Set(products.map(p=>p.category))),[products]);
 const visible=useMemo(()=>filterProducts(products,query,category),[products,query,category]);
 if(loading)return <View style={s.center}><ActivityIndicator/><Text>Carregando catálogo…</Text></View>;
 if(error)return <View style={s.center}><Text>Não foi possível carregar o catálogo.</Text><Pressable style={s.chip} onPress={()=>setRetry(value=>value+1)}><Text>Tentar novamente</Text></Pressable></View>;
 return <View style={s.page}><Text style={s.title}>Loja</Text><TextInput value={query} onChangeText={setQuery} placeholder="Buscar produto" style={s.input}/><View style={s.chips}><Pressable onPress={()=>setCategory("")} style={[s.chip,!category&&s.active]}><Text>Todos</Text></Pressable>{categories.map(c=><Pressable key={c} onPress={()=>setCategory(c)} style={[s.chip,category===c&&s.active]}><Text>{c}</Text></Pressable>)}</View><FlatList data={visible} keyExtractor={p=>p.slug} renderItem={({item})=><Pressable style={s.card} onPress={()=>router.push({pathname:"/loja/[slug]",params:{slug:item.slug}})}><Image source={productImageSource(item.image)} style={s.image}/><View style={{flex:1}}><Text style={s.name}>{item.title}</Text><Text style={s.category}>{item.category}</Text><Text>{formatPrice(item.priceCents)}</Text></View></Pressable>} ListEmptyComponent={<Text>Nenhum produto encontrado.</Text>}/></View>;
}
const s=StyleSheet.create({page:{flex:1,padding:20,backgroundColor:"#f4f6f8"},center:{flex:1,alignItems:"center",justifyContent:"center",gap:10},title:{fontSize:28,fontWeight:"700",marginBottom:12},input:{backgroundColor:"white",borderWidth:1,borderColor:"#ddd",borderRadius:10,padding:12},chips:{flexDirection:"row",flexWrap:"wrap",gap:8,marginVertical:12},chip:{paddingVertical:8,paddingHorizontal:12,borderRadius:20,backgroundColor:"white"},active:{borderWidth:1,borderColor:"#0A2E5D"},card:{flexDirection:"row",gap:14,padding:12,marginBottom:10,borderRadius:12,backgroundColor:"white"},image:{width:90,height:90,borderRadius:8},name:{fontWeight:"700",fontSize:16},category:{color:"#666",marginVertical:4}});

