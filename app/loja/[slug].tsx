import { useEffect,useState } from "react";
import { ActivityIndicator,Image,Pressable,StyleSheet,Text,View } from "react-native";
import { router,useLocalSearchParams } from "expo-router";
import { formatPrice,getProductBySlug,Product } from "../../lib/products";
import { useCart } from "../../context/CartContext";

export default function ProductDetail(){const {slug}=useLocalSearchParams<{slug:string}>();const [product,setProduct]=useState<Product>();const {add}=useCart();
 useEffect(()=>{if(slug)getProductBySlug(slug).then(setProduct)},[slug]);
 if(!product)return <View style={s.center}><ActivityIndicator/></View>;
 return <View style={s.page}><Pressable onPress={()=>router.back()}><Text>← Voltar</Text></Pressable><Image source={{uri:product.image}} style={s.image}/><Text style={s.title}>{product.title}</Text><Text style={s.category}>{product.category}</Text><Text style={s.price}>{formatPrice(product.priceCents)}</Text><Text style={s.description}>{product.description}</Text><Pressable style={s.button} onPress={()=>{add({slug:product.slug,title:product.title,priceCents:product.priceCents,image:product.image},1);router.push("/carrinho")}}><Text style={s.buttonText}>Adicionar ao carrinho</Text></Pressable></View>;
}
const s=StyleSheet.create({page:{flex:1,padding:20,backgroundColor:"#f4f6f8"},center:{flex:1,alignItems:"center",justifyContent:"center"},image:{width:"100%",height:260,marginVertical:20,borderRadius:12},title:{fontSize:28,fontWeight:"700"},category:{marginTop:6,color:"#666"},price:{fontSize:20,fontWeight:"700",marginTop:14},description:{fontSize:16,lineHeight:24,marginTop:14},button:{marginTop:24,backgroundColor:"#0A2E5D",padding:15,borderRadius:10,alignItems:"center"},buttonText:{color:"white",fontWeight:"700"}});
