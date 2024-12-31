import streamlit as st
import pandas as pd
import pydeck as pdk
import numpy as np

# Seitentitel und Layout
st.set_page_config(layout="wide", page_title="Immobilien Trier 3D Map")
st.title('Immobilien in Trier - 3D Karte')

# Formatierungsfunktionen
def format_price(x):
    if pd.isna(x):
        return "Keine Angabe"
    return f"{int(x):,d}€".replace(',', '.')

def format_area(x):
    if pd.isna(x):
        return "Keine Angabe"
    return f"{int(x)}m²"

def format_price_sqm(x):
    if pd.isna(x):
        return "Keine Angabe"
    return f"{int(x):,d}€/m²".replace(',', '.')

# Daten einlesen
@st.cache_data
def load_data():
    df = pd.read_csv('data/miete_trier50km_detailed2.csv')
    df['Zimmer'] = df['Zimmer'].fillna('Keine Angabe')
    # Koordinaten für das Zentrum von Trier
    df['lat'] = df['Latitude']
    df['lon'] = df['Longitude']
    
    # Formatierte Preise und Werte für Tooltip
    df['preis_formatted'] = df['Preis_cleaned'].apply(format_price)
    df['flaeche_formatted'] = df['Wohnfläche'].apply(format_area)
    df['preis_qm_formatted'] = df['Preis_pro_qm'].apply(format_price_sqm)
    
    return df

df = load_data()

# Sidebar für Filter
st.sidebar.header('Filter')

# Preisrange Filter für nicht-NaN Werte
valid_prices = df['Preis_cleaned'].dropna()
price_range = st.sidebar.slider(
    'Preisbereich (€)',
    float(valid_prices.min()),
    float(valid_prices.max()),
    (float(valid_prices.min()), float(valid_prices.max()))
)

# Zimmeranzahl Filter
available_rooms = sorted([x for x in df['Zimmer'].unique() if x != 'Keine Angabe']) + ['Keine Angabe']
rooms = st.sidebar.multiselect(
    'Anzahl Zimmer',
    options=available_rooms,
    default=available_rooms
)

# Daten filtern
filtered_df = df[
    (df['Preis_cleaned'].between(price_range[0], price_range[1]) | df['Preis_cleaned'].isna()) &
    (df['Zimmer'].isin(rooms))
]

# Berechnung der Höhe für die 3D-Darstellung
# Standardhöhe für NaN-Werte
filtered_df['height'] = 100  # Standardhöhe
valid_prices_mask = filtered_df['Preis_cleaned'].notna()
if valid_prices_mask.any():
    min_price = filtered_df.loc[valid_prices_mask, 'Preis_cleaned'].min()
    max_price = filtered_df.loc[valid_prices_mask, 'Preis_cleaned'].max()
    filtered_df.loc[valid_prices_mask, 'height'] = (
        (filtered_df.loc[valid_prices_mask, 'Preis_cleaned'] - min_price) / 
        (max_price - min_price) * 1000
    )

# Farbskalierung basierend auf Preis pro m²
filtered_df['color_scale'] = 128  # Standardfarbe (mittleres Blau) für NaN-Werte
valid_price_sqm_mask = filtered_df['Preis_pro_qm'].notna()
if valid_price_sqm_mask.any():
    min_price_sqm = filtered_df.loc[valid_price_sqm_mask, 'Preis_pro_qm'].min()
    max_price_sqm = filtered_df.loc[valid_price_sqm_mask, 'Preis_pro_qm'].max()
    filtered_df.loc[valid_price_sqm_mask, 'color_scale'] = (
        (filtered_df.loc[valid_price_sqm_mask, 'Preis_pro_qm'] - min_price_sqm) / 
        (max_price_sqm - min_price_sqm) * 255
    )

# Layer erstellen
column_layer = pdk.Layer(
    "ColumnLayer",
    data=filtered_df,
    get_position=["lon", "lat"],
    get_elevation="height",
    elevation_scale=1,
    radius=50,
    get_fill_color=["color_scale", "0", "255 - color_scale", 140],
    pickable=True,
    auto_highlight=True
)

# Tooltip mit vorformatierten Werten
tooltip = {
    "html": "<b>Preis:</b> {preis_formatted}<br/>"
            "<b>Fläche:</b> {flaeche_formatted}<br/>"
            "<b>Zimmer:</b> {Zimmer}<br/>"
            "<b>Preis/m²:</b> {preis_qm_formatted}<br/>"
            "<b>Adresse:</b> {Adresse}",
    "style": {
        "backgroundColor": "steelblue",
        "color": "white",
        "fontSize": "0.8em",
        "padding": "10px"
    }
}

# Initiale Ansicht
view_state = pdk.ViewState(
    latitude=49.75,  # Zentrum von Trier
    longitude=6.64,
    zoom=12,
    pitch=45,
    bearing=0
)

# Deck erstellen
r = pdk.Deck(
    layers=[column_layer],
    initial_view_state=view_state,
    tooltip=tooltip,
    map_style='mapbox://styles/mapbox/dark-v10'
)

# Karte in zwei Spalten anzeigen
col1, col2 = st.columns([2, 1])

with col1:
    st.pydeck_chart(r)

with col2:
    st.subheader("Statistiken")
    st.metric("Anzahl Objekte", len(filtered_df))
    mean_price = filtered_df['Preis_cleaned'].mean()
    st.metric("Durchschnittspreis", 
              format_price(mean_price) if pd.notna(mean_price) else "Keine Angabe")
    mean_area = filtered_df['Wohnfläche'].mean()
    st.metric("Durchschnittliche Wohnfläche", 
              format_area(mean_area) if pd.notna(mean_area) else "Keine Angabe")
    
    # Top 5 teuerste Objekte
    st.subheader("Top 5 teuerste Objekte")
    top_5 = filtered_df.nlargest(5, 'Preis_cleaned')[
        ['preis_formatted', 'flaeche_formatted', 'Zimmer', 'Adresse']
    ].rename(columns={
        'preis_formatted': 'Preis',
        'flaeche_formatted': 'Fläche'
    })
    st.dataframe(top_5)

# Detailansicht
st.subheader("Detaillierte Datenansicht")
if st.checkbox("Zeige alle Daten"):
    display_df = filtered_df[[
        'preis_formatted', 'flaeche_formatted', 'Zimmer', 
        'preis_qm_formatted', 'Adresse', 'Beschreibung'
    ]].rename(columns={
        'preis_formatted': 'Preis',
        'flaeche_formatted': 'Fläche',
        'preis_qm_formatted': 'Preis/m²'
    })
    st.dataframe(display_df)

# Legende für Farbskala
st.sidebar.subheader("Farbskala")
st.sidebar.write("Die Farbe der Säulen zeigt den Preis pro m²:")
st.sidebar.write("• Blau = niedrigerer Preis/m²")
st.sidebar.write("• Rot = höherer Preis/m²")
st.sidebar.write("Die Höhe der Säulen zeigt den Gesamtpreis.")
st.sidebar.write("Graue Säulen: Keine Preisangabe verfügbar")