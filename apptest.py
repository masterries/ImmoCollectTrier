import pandas as pd
import pydeck as pdk
import os
import streamlit as st
# -------------------------------
# 1. Load and Preprocess Data
# -------------------------------

# Define the path to the CSV file
csv_path = os.path.join("data", "miete_trier50km_detailed2.csv")

# Check if the CSV file exists
if not os.path.exists(csv_path):
    st.error(f"CSV file not found at path: {csv_path}")
    st.stop()

# Read the CSV data into a pandas DataFrame
try:
    df = pd.read_csv(csv_path)
except Exception as e:
    st.error(f"Error reading CSV file: {e}")
    st.stop()

# Data Cleaning
# Convert relevant columns to numeric, coercing errors to NaN
numeric_columns = ['Latitude', 'Longitude', 'Preis_cleaned', 'Wohnfläche', 
                   'Grundstücksfläche', 'Zimmer', 'Preis_pro_qm']
for col in numeric_columns:
    if col in df.columns:
        df[col] = pd.to_numeric(df[col], errors='coerce')
    else:
        st.warning(f"Column '{col}' not found in the CSV.")

# Drop rows with missing coordinates
df = df.dropna(subset=['Latitude', 'Longitude'])

# Handle missing 'Zimmer' by filling with median or appropriate value
if df['Zimmer'].isnull().any():
    median_zimmer = df['Zimmer'].median()
    df['Zimmer'].fillna(median_zimmer, inplace=True)

# -------------------------------
# 2. Streamlit App Layout
# -------------------------------

st.set_page_config(page_title="Real Estate Listings in Trier", layout="wide")

st.title("🏠 Real Estate Listings in Trier")

st.markdown("""
This interactive map displays real estate listings available for purchase in Trier. Use the filters on the sidebar to narrow down your search based on your preferences.
""")

# -------------------------------
# 3. Sidebar Filters
# -------------------------------

st.sidebar.header("Filter Listings")

# Price Range Filter
if 'Preis_cleaned' in df.columns:
    min_price = int(df['Preis_cleaned'].min())
    max_price = int(df['Preis_cleaned'].max())
    price_range = st.sidebar.slider(
        "Preis (€)",
        min_price,
        max_price,
        (min_price, max_price),
        step=10000
    )
else:
    st.sidebar.warning("Price data ('Preis_cleaned') not available.")
    price_range = (0, 0)

# Number of Rooms Filter
if 'Zimmer' in df.columns:
    min_rooms = int(df['Zimmer'].min())
    max_rooms = int(df['Zimmer'].max())
    rooms = st.sidebar.slider(
        "Zimmer",
        min_rooms,
        max_rooms,
        (min_rooms, max_rooms),
        step=1
    )
else:
    st.sidebar.warning("Room data ('Zimmer') not available.")
    rooms = (0, 0)

# Wohnfläche (Living Area) Filter
if 'Wohnfläche' in df.columns:
    min_area = int(df['Wohnfläche'].min())
    max_area = int(df['Wohnfläche'].max())
    wohnfläche = st.sidebar.slider(
        "Wohnfläche (m²)",
        min_area,
        max_area,
        (min_area, max_area),
        step=5
    )
else:
    st.sidebar.warning("Living area data ('Wohnfläche') not available.")
    wohnfläche = (0, 0)

# Filter the DataFrame based on user input
filtered_df = df.copy()

if 'Preis_cleaned' in df.columns:
    filtered_df = filtered_df[
        (filtered_df['Preis_cleaned'] >= price_range[0]) &
        (filtered_df['Preis_cleaned'] <= price_range[1])
    ]

if 'Zimmer' in df.columns:
    filtered_df = filtered_df[
        (filtered_df['Zimmer'] >= rooms[0]) &
        (filtered_df['Zimmer'] <= rooms[1])
    ]

if 'Wohnfläche' in df.columns:
    filtered_df = filtered_df[
        (filtered_df['Wohnfläche'] >= wohnfläche[0]) &
        (filtered_df['Wohnfläche'] <= wohnfläche[1])
    ]

st.sidebar.markdown(f"### {len(filtered_df)} Listings Found")

# -------------------------------
# 4. Display Interactive Map
# -------------------------------

st.subheader("📍 Listings Map")

if filtered_df.empty:
    st.warning("No listings match the selected filters.")
else:
    # Define the initial view state centered around Trier, Germany
    initial_view = pdk.ViewState(
        latitude=49.75,
        longitude=6.65,
        zoom=12,
        pitch=0
    )

    # Define the Scatterplot layer
    scatter_layer = pdk.Layer(
        'ScatterplotLayer',
        data=filtered_df,
        get_position='[Longitude, Latitude]',
        auto_highlight=True,
        get_radius=100,  # Radius in meters
        get_fill_color='[255, 140, 0, 160]',  # Orange color with transparency
        pickable=True
    )

    # Define the tooltip
    tooltip = {
        "html": "<b>Preis:</b> {Preis}<br/>"
                "<b>Beschreibung:</b> {Beschreibung}<br/>"
                "<b>Details:</b> {Details}<br/>"
                "<b>Adresse:</b> {Adresse}<br/>"
                "<b>Preis pro m²:</b> {Preis_pro_qm} €/m²<br/>"
                '<a href="{Link}" target="_blank">Mehr Details</a>',
        "style": {
            "backgroundColor": "steelblue",
            "color": "white"
        }
    }

    # Create the Pydeck map
    r = pdk.Deck(
        map_style='mapbox://styles/mapbox/light-v9',
        initial_view_state=initial_view,
        layers=[scatter_layer],
        tooltip=tooltip
    )

    # Display the map
    st.pydeck_chart(r)

# -------------------------------
# 5. Display Listings Table
# -------------------------------

st.subheader("📋 Listings Table")

# Select columns to display, ensure they exist
display_columns = [
    "Link",
    "Preis",
    "Beschreibung",
    "Details",
    "Adresse",
    "Features",
    "Preis_pro_qm",
    "Zimmer",
    "Wohnfläche",
    "Grundstücksfläche"
]

available_display_columns = [col for col in display_columns if col in filtered_df.columns]

if not available_display_columns:
    st.warning("No available data to display in the table.")
else:
    # Function to create clickable links in the table
    def make_clickable(link):
        return f'<a href="{link}" target="_blank">Link</a>'

    # Apply the clickable link if 'Link' column exists
    if 'Link' in available_display_columns:
        filtered_df = filtered_df.copy()  # To avoid SettingWithCopyWarning
        filtered_df['Link'] = filtered_df['Link'].apply(make_clickable)

    # Display the table with HTML rendering
    st.markdown(filtered_df[available_display_columns].to_html(escape=False, index=False), unsafe_allow_html=True)

# -------------------------------
# 6. Additional Information
# -------------------------------

st.markdown("""
---
**Note**: This map and table display real estate listings available for purchase in Trier as of December 31, 2024. Prices are listed in Euros (€), and the data includes various features such as the number of rooms, living area, and more.

*Data Source: [Immowelt](https://www.immowelt.de/)*
""")
