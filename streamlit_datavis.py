# streamlit_app.py
import streamlit as st
import pandas as pd
import requests
from urllib.parse import urlparse
import os

# Configuration
DATA_FILE = "data/miete_trier50km_detailed2.csv"
IMAGE_BASE_DIR = "data/images/"

def load_data():
    """Load and preprocess the real estate data"""
    df = pd.read_csv(DATA_FILE, sep=',', parse_dates=['created_date'])
    
    # Clean image URLs
    df['Images'] = df['Images'].apply(lambda x: x.split(';') if isinstance(x, str) else [])
    
    # Convert numeric columns
    numeric_cols = ['Preis', 'Zimmer', 'Wohnfläche', 'Grundstücksfläche']
    for col in numeric_cols:
        df[col] = pd.to_numeric(df[col], errors='coerce')
    
    return df

def is_valid_image_url(url):
    """Check if URL has a valid ci_seal parameter"""
    parsed = urlparse(url)
    return 'ci_seal' in parsed.query

def display_property_images(image_urls):
    """Display image gallery with valid seal URLs"""
    valid_images = [url for url in image_urls if is_valid_image_url(url)]
    
    if not valid_images:
        st.warning("No valid images available for this property")
        return
    
    cols = st.columns(3)
    for idx, url in enumerate(valid_images):
        try:
            with cols[idx % 3]:
                st.image(url, use_column_width=True, caption=f"Image {idx+1}")
        except Exception as e:
            st.error(f"Error loading image: {str(e)}")

def main():
    st.set_page_config(page_title="Real Estate Browser", layout="wide")
    st.title("🏠 Immowelt Property Explorer")
    
    # Load data with caching
    df = load_data()
    
    # Sidebar filters
    st.sidebar.header("Filter Properties")
    price_range = st.sidebar.slider(
        "Price Range (€)",
        min_value=int(df['Preis'].min()),
        max_value=int(df['Preis'].max()),
        value=(int(df['Preis'].min()), int(df['Preis'].max()))
    )
    
    # Area filter
    area_range = st.sidebar.slider(
        "Living Area (m²)",
        min_value=int(df['Wohnfläche'].min()),
        max_value=int(df['Wohnfläche'].max()),
        value=(int(df['Wohnfläche'].min()), int(df['Wohnfläche'].max()))
    )
    
    # Filter dataframe
    filtered_df = df[
        (df['Preis'] >= price_range[0]) & 
        (df['Preis'] <= price_range[1]) &
        (df['Wohnfläche'] >= area_range[0]) & 
        (df['Wohnfläche'] <= area_range[1])
    ]
    
    # Main content
    col1, col2 = st.columns([1, 2])
    
    with col1:
        st.subheader("Available Properties")
        selected_property = st.selectbox(
            "Select a property",
            filtered_df.index,
            format_func=lambda x: f"{filtered_df.loc[x, 'Beschreibung']} - €{filtered_df.loc[x, 'Preis']:,}"
        )
    
    with col2:
        if selected_property:
            property_data = filtered_df.loc[selected_property]
            st.subheader(property_data['Beschreibung'])
            
            # Create tabs
            tab1, tab2, tab3 = st.tabs(["📷 Images", "📄 Details", "🗺️ Map"])
            
            with tab1:
                display_property_images(property_data['Images'])
            
            with tab2:
                st.write(f"**Price:** €{property_data['Preis']:,.2f}")
                st.write(f"**Living Area:** {property_data['Wohnfläche']} m²")
                st.write(f"**Rooms:** {property_data['Zimmer']}")
                st.write(f"**Address:** {property_data['Vollständige_Adresse']}")
                
                if pd.notna(property_data['Features']):
                    with st.expander("Features"):
                        features = property_data['Features'].split('; ')
                        for feat in features:
                            st.write(f"- {feat}")
            
            with tab3:
                if pd.notna(property_data['Latitude']) and pd.notna(property_data['Longitude']):
                    st.map(pd.DataFrame({
                        'lat': [property_data['Latitude']],
                        'lon': [property_data['Longitude']]
                    }), zoom=12)
                else:
                    st.warning("No location data available for this property")

if __name__ == "__main__":
    main()
