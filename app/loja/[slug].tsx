import { productImageSource } from "../../lib/product-images";
import { useEffect,useState } from "react";
import { ActivityIndicator,Image,Pressable,StyleSheet,Text,View } from "react-native";
import { router,useLocalSearchParams } from "expo-router";
import { formatPrice,getProductBySlug,Product } from "../../lib/products";
import { useCart } from "../../context/CartContext";

export default function ProductDetail(){const {slug}=useLocalSearchParams<{slug:string}>();const [product,setProduct]=useState<Product>();const [loading,setLoading]=useState(true);const {add}=useCart();
 const [error,setError]=useState(false); const [retry,setRetry]=useState(0);
 useEffect(()=>{let active=true;setLoading(true);setError(false);setProduct(undefined);if(!slug){setLoading(false);return}getProductBySlug(slug).then((value)=>{if(active)setProduct(value)}).catch(()=>{if(active)setError(true)}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[slug,retry]);
 if(loading)return <View style={s.center}><ActivityIndicator/><Text>Carregando produto…</Text></View>;
 if(error)return <View style={s.center}><Text>Não foi possível carregar o produto.</Text><Pressable style={s.button} onPress={()=>setRetry(value=>value+1)}><Text style={s.buttonText}>Tentar novamente</Text></Pressable></View>;
 if(!product)return <View style={s.center}><Text style={s.title}>Produto não encontrado.</Text><Pressable style={s.button} onPress={()=>router.replace("/loja")}><Text style={s.buttonText}>Voltar à loja</Text></Pressable></View>;
 return <View style={s.page}><Pressable onPress={()=>router.back()}><Text>← Voltar</Text></Pressable><Image source={productImageSource(product.image)} style={s.image}/><Text style={s.title}>{product.title}</Text><Text style={s.category}>{product.category}</Text><Text style={s.price}>{formatPrice(product.priceCents)}</Text><Text style={s.description}>{product.description}</Text><Pressable style={s.button} onPress={()=>{add({slug:product.slug,title:product.title,priceCents:product.priceCents,image:product.image},1);router.push("/carrinho")}}><Text style={s.buttonText}>Adicionar ao carrinho</Text></Pressable></View>;
}
const s=StyleSheet.create({page:{flex:1,padding:20,backgroundColor:"#f4f6f8"},center:{flex:1,alignItems:"center",justifyContent:"center"},image:{width:"100%",height:260,marginVertical:20,borderRadius:12},title:{fontSize:28,fontWeight:"700"},category:{marginTop:6,color:"#666"},price:{fontSize:20,fontWeight:"700",marginTop:14},description:{fontSize:16,lineHeight:24,marginTop:14},button:{marginTop:24,backgroundColor:"#0A2E5D",padding:15,borderRadius:10,alignItems:"center"},buttonText:{color:"white",fontWeight:"700"}});

