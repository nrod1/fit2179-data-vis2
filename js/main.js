/* ============================================================
   FIT2179 Data Visualisation 2 — Australia Tourism
   All Vega-Lite & Vega chart specifications
   ============================================================ */

// GitHub raw base URL
const DATA_BASE = "https://raw.githubusercontent.com/nrod1/fit2179-data-vis2/main/data/";
const SANKY_DATA = DATA_BASE + "sankey_data.csv";

const TEAL   = "#1a8fa0";
const GOLD   = "#e8a020";
const CORAL  = "#e05a40";
const NAVY   = "#0d3348";
const LIGHT  = "#8ecfdc";
const GREEN  = "#3aa86e";
const PURPLE = "#7c5cbf";

const YEAR_ORDER = [
  "2016-17","2017-18","2018-19","2019-20",
  "2020-21","2021-22","2022-23","2023-24","2024-25"
];

/* ================================================================
   CHART 0 — Sankey Diagram (Standard Vega v5)
   ================================================================ */
const chart0_sankey = {
  "$schema": "https://vega.github.io/schema/vega/v6.json",
  "width": 750,
  "height": 380,
  "padding": 10,
  "data": [
    {
      "name": "raw",
      "url": DATA_BASE + "sankey_data.csv",
      "format": {"type": "csv", "parse": "auto"}
    },
    {
      "name": "nodes",
      "source": "raw",
      "transform": [
        { "type": "formula", "expr": "datum.source", "as": "name" },
        { "type": "aggregate", "groupby": ["name"] }
      ]
    },
    {
      "name": "destinations",
      "source": "raw",
      "transform": [
        { "type": "formula", "expr": "datum.destination", "as": "name" },
        { "type": "aggregate", "groupby": ["name"] }
      ]
    },
    {
      "name": "all_nodes",
      "source": ["nodes", "destinations"],
      "transform": [
        { "type": "aggregate", "groupby": ["name"] },
        { "type": "identifier", "as": "index" }
      ]
    },
    {
      "name": "links",
      "source": "raw",
      "transform": [
        { "type": "lookup", "from": "all_nodes", "key": "name", "fields": ["source"], "as": ["sourceNode"] },
        { "type": "lookup", "from": "all_nodes", "key": "name", "fields": ["destination"], "as": ["targetNode"] },
        { "type": "formula", "expr": "datum.sourceNode.index", "as": "source" },
        { "type": "formula", "expr": "datum.targetNode.index", "as": "target" },
        { "type": "sankey", "source": "source", "target": "target", "value": "value", "nodeId": "index", "size": [{"signal": "width"}, {"signal": "height"}], "nodeWidth": 15, "nodePadding": 15 }
      ]
    }
  ],
  "scales": [
    {
      "name": "color",
      "type": "ordinal",
      "domain": {"data": "all_nodes", "field": "name"},
      "range": {"scheme": "category20"}
    }
  ],
  "marks": [
    {
      "type": "path",
      "from": {"data": "links"},
      "encode": {
        "update": {
          "path": {"field": "path"},
          "stroke": {"scale": "color", "field": "sourceNode.name"},
          "strokeOpacity": {"value": 0.3},
          "strokeWidth": {"field": "thickness"},
          "fill": {"value": "none"},
          "tooltip": {"signal": "datum.sourceNode.name + ' → ' + datum.targetNode.name + ': ' + datum.value + 'k visitors'"}
        },
        "hover": {
          "strokeOpacity": {"value": 0.7}
        }
      }
    },
    {
      "type": "rect",
      "from": {"data": "all_nodes"},
      "encode": {
        "update": {
          "x": {"field": "x0"},
          "x2": {"field": "x1"},
          "y": {"field": "y0"},
          "y2": {"field": "y1"},
          "fill": {"scale": "color", "field": "name"},
          "tooltip": {"signal": "datum.name"}
        },
        "hover": {
          "fillOpacity": {"value": 0.8}
        }
      }
    },
    {
      "type": "text",
      "from": {"data": "all_nodes"},
      "encode": {
        "update": {
          "x": {"signal": "datum.x0 < width / 2 ? datum.x1 + 8 : datum.x0 - 8"},
          "y": {"signal": "(datum.y0 + datum.y1) / 2"},
          "text": {"field": "name"},
          "align": {"signal": "datum.x0 < width / 2 ? 'left' : 'right'"},
          "baseline": {"value": "middle"},
          "fontSize": {"value": 12},
          "fontWeight": {"value": "bold"},
          "font": {"value": "sans-serif"},
          "fill": {"value": "#1a2e38"}
        }
      }
    }
  ]
};

/* ================================================================
   CHART 1 — Choropleth Map with Time Slider
   ================================================================ */
const chart1_choropleth = {
  "$schema": "https://vega.github.io/schema/vega-lite/v6.json",
  "width": "container",
  "height": 420,
  "projection": { "type": "mercator" },
  
  // Base Data: The timeline CSV allows filtering before joining GeoJSON
  "data": { "url": DATA_BASE + "choropleth_timeline.csv" },
  
  "params": [
    {
      "name": "Year_selection",
      "value": 2020,
      "bind": {
        "input": "range",
        "min": 2020,
        "max": 2025,
        "step": 1,
        "name": "Select Year: "
      }
    },
    {
      "name": "hover",
      "select": {"type": "point", "on": "mouseover"}
    }
  ],
  
  "transform": [
    // Filter the CSV data by the slider year
    { "filter": "datum.Year == Year_selection" },
    // Lookup the geographic boundaries for the matching state
    {
      "lookup": "STATE_NAME",
      "from": {
        "data": {
          "url": DATA_BASE + "australia_states_simple.topojson",
          "format": { "type": "topojson", "feature": "states" }
        },
        "key": "properties.STATE_NAME"
      },
      "as": "geo"
    }
  ],
  
  "mark": { "type": "geoshape", "stroke": "#ffffff", "strokeWidth": 1.5, "cursor": "pointer" },
  
  "encoding": {
    "shape": { "field": "geo", "type": "geojson" },
    "color": {
      "field": "total_businesses",
      "type": "quantitative",
      "scale": {
        "scheme": "tealblues",
        "domain": [0, 80000]
      },
      "legend": { "title": "Tourism Businesses", "format": ",.0f", "orient": "bottom-right" }
    },
    "opacity": {
      "condition": {"param": "hover", "empty": false, "value": 1},
      "value": 0.6
    },
    "tooltip": [
      { "field": "STATE_NAME", "type": "nominal", "title": "State" },
      { "field": "Year", "type": "ordinal", "title": "Year" },
      { "field": "total_businesses", "type": "quantitative", "title": "Total Businesses", "format": "," }
    ]
  }
};

/* ================================================================
   CHART 2 — Line Chart: Tourism GDP Over Time
   ================================================================ */
const chart2_gdp_trend = {
  "$schema": "https://vega.github.io/schema/vega-lite/v6.json",
  "width": "container",
  "height": 260,
  "data": { "url": DATA_BASE + "tourism_gdp.csv" },
  "layer": [
    {
      "mark": { "type": "area", "line": true, "color": TEAL, "fillOpacity": 0.15 },
      "encoding": {
        "x": {
          "field": "year", "type": "ordinal",
          "sort": YEAR_ORDER,
          "axis": { "title": null, "labelAngle": -30, "labelFontSize": 11 }
        },
        "y": {
          "field": "tourism_gdp_m", "type": "quantitative",
          "axis": { "title": "Tourism GDP ($M)", "format": ",.0f", "labelFontSize": 11 }
        },
        "color": { "value": TEAL }
      }
    },
    {
      "params": [{
        "name": "hover",
        "select": {"type": "point", "on": "mouseover", "clear": "mouseout", "nearest": true}
      }],
      "mark": { "type": "point", "size": 100, "opacity": 0, "tooltip": true },
      "encoding": {
        "x": { "field": "year", "type": "ordinal", "sort": YEAR_ORDER },
        "y": { "field": "tourism_gdp_m", "type": "quantitative" },
        "tooltip": [
          { "field": "year", "type": "ordinal", "title": "Year" },
          { "field": "tourism_gdp_m", "type": "quantitative", "title": "Tourism GDP ($M)", "format": ",.0f" },
          { "field": "gdp_share_pct", "type": "quantitative", "title": "Share of Economy (%)", "format": ".1f" }
        ]
      }
    },
    {
      "mark": { "type": "point", "filled": true, "size": 60, "color": TEAL },
      "encoding": {
        "x": { "field": "year", "type": "ordinal", "sort": YEAR_ORDER },
        "y": { "field": "tourism_gdp_m", "type": "quantitative" },
        "opacity": {
          "condition": {"param": "hover", "empty": true, "value": 1},
          "value": 1
        },
        "size": {
          "condition": {"param": "hover", "empty": false, "value": 120},
          "value": 60
        }
      }
    },
    {
      "mark": { "type": "text", "align": "left", "dx": 8, "dy": -8, "fontWeight": "bold", "color": NAVY },
      "encoding": {
        "x": { "field": "year", "type": "ordinal", "sort": YEAR_ORDER },
        "y": { "field": "tourism_gdp_m", "type": "quantitative" },
        "text": { "signal": "format(datum.tourism_gdp_m, '$,.0f') + ' M'" },
        "opacity": {
          "condition": {"param": "hover", "empty": false, "value": 1},
          "value": 0
        }
      }
    },
    {
      "data": { "values": [{ "year": "2020-21", "note": "COVID-19 impact" }] },
      "mark": { "type": "rule", "strokeDash": [4, 4], "color": CORAL, "strokeWidth": 1.5 },
      "encoding": {
        "x": { "field": "year", "type": "ordinal", "sort": YEAR_ORDER }
      }
    },
    {
      "data": { "values": [{ "year": "2020-21", "y": 75000, "note": "▼ COVID-19 collapse" }] },
      "mark": { "type": "text", "color": CORAL, "fontSize": 10, "fontWeight": "bold", "dx": 6, "align": "left" },
      "encoding": {
        "x": { "field": "year", "type": "ordinal", "sort": YEAR_ORDER },
        "y": { "field": "y", "type": "quantitative" },
        "text": { "field": "note", "type": "nominal" }
      }
    }
  ]
};

/* ================================================================
   CHART 3 — Stacked Area Chart: GDP by Visitor Type
   ================================================================ */
const chart3_visitor_type = {
  "$schema": "https://vega.github.io/schema/vega-lite/v6.json",
  "width": "container",
  "height": 260,
  "data": { "url": DATA_BASE + "gdp_by_visitor_type.csv" },
  "params": [{
    "name": "hover",
    "select": {"type": "point", "on": "mouseover", "clear": "mouseout", "fields": ["visitor_type"]}
  }],
  "mark": { "type": "area", "interpolate": "monotone", "cursor": "pointer" },
  "encoding": {
    "x": {
      "field": "year", "type": "ordinal",
      "sort": YEAR_ORDER,
      "axis": { "title": null, "labelAngle": -30, "labelFontSize": 11 }
    },
    "y": {
      "field": "gdp_m", "type": "quantitative",
      "stack": "normalize",
      "axis": { "title": "Share of Tourism GDP", "format": ".0%", "labelFontSize": 11 }
    },
    "color": {
      "field": "visitor_type", "type": "nominal",
      "scale": {
        "domain": ["Domestic Household", "Domestic Business", "International"],
        "range": [TEAL, LIGHT, GOLD]
      },
      "legend": { "title": "Visitor Type", "orient": "bottom" }
    },
    "opacity": {
      "condition": {"param": "hover", "empty": false, "value": 1},
      "value": 0.5
    },
    "tooltip": [
      { "field": "year", "type": "ordinal", "title": "Year" },
      { "field": "visitor_type", "type": "nominal", "title": "Visitor Type" },
      { "field": "gdp_m", "type": "quantitative", "title": "GDP ($M)", "format": ",.0f" }
    ]
  }
};

/* ================================================================
   CHART 4 — Horizontal Bar: Jobs by Industry (2024-25)
   ================================================================ */
const chart4_jobs_industry = {
  "$schema": "https://vega.github.io/schema/vega-lite/v6.json",
  "width": "container",
  "height": 320,
  "data": { "url": DATA_BASE + "jobs_by_industry_2024.csv" },
  "params": [{
    "name": "highlight",
    "select": {"type": "point", "on": "mouseover"}
  }],
  "mark": { "type": "bar", "cornerRadiusEnd": 4, "cursor": "pointer" },
  "encoding": {
    "y": {
      "field": "industry", "type": "nominal",
      "sort": { "field": "jobs", "order": "descending" },
      "axis": { "title": null, "labelFontSize": 11 }
    },
    "x": {
      "field": "jobs", "type": "quantitative",
      "axis": { "title": "Tourism Main Jobs ('000)", "labelFontSize": 11 }
    },
    "color": {
      "condition": [
        { "test": "datum.industry === 'Cafes & Restaurants'", "value": TEAL },
        { "test": "datum.industry === 'Retail Trade'", "value": TEAL }
      ],
      "value": LIGHT
    },
    "opacity": {
      "condition": {"param": "highlight", "empty": false, "value": 1},
      "value": 0.4
    },
    "tooltip": [
      { "field": "industry", "type": "nominal", "title": "Industry" },
      { "field": "jobs", "type": "quantitative", "title": "Jobs ('000)", "format": ".1f" }
    ]
  }
};

/* ================================================================
   CHART 5 — Line Chart: Total Tourism Jobs Trend
   ================================================================ */
const chart5_jobs_trend = {
  "$schema": "https://vega.github.io/schema/vega-lite/v6.json",
  "width": "container",
  "height": 220,
  "data": { "url": DATA_BASE + "jobs_trend.csv" },
  "layer": [
    {
      "mark": { "type": "area", "interpolate": "monotone", "color": GOLD, "fillOpacity": 0.15, "line": true },
      "encoding": {
        "x": {
          "field": "year", "type": "ordinal",
          "sort": YEAR_ORDER,
          "axis": { "title": null, "labelAngle": -30, "labelFontSize": 11 }
        },
        "y": {
          "field": "total_jobs_thousands", "type": "quantitative",
          "axis": { "title": "Jobs ('000)", "labelFontSize": 11 },
          "scale": { "domain": [300, 700] }
        },
        "y2": { "value": 300 },
        "color": { "value": GOLD }
      }
    },
    {
      "params": [{
        "name": "hover",
        "select": {"type": "point", "on": "mouseover", "clear": "mouseout", "nearest": true}
      }],
      "mark": { "type": "point", "size": 100, "opacity": 0, "tooltip": true },
      "encoding": {
        "x": { "field": "year", "type": "ordinal", "sort": YEAR_ORDER },
        "y": { "field": "total_jobs_thousands", "type": "quantitative" },
        "tooltip": [
          { "field": "year", "type": "ordinal", "title": "Year" },
          { "field": "total_jobs_thousands", "type": "quantitative", "title": "Total Jobs ('000)", "format": ",.1f" }
        ]
      }
    },
    {
      "mark": { "type": "point", "filled": true, "size": 55, "color": GOLD },
      "encoding": {
        "x": { "field": "year", "type": "ordinal", "sort": YEAR_ORDER },
        "y": { "field": "total_jobs_thousands", "type": "quantitative" },
        "size": {
          "condition": {"param": "hover", "empty": false, "value": 120},
          "value": 55
        }
      }
    },
    {
      "mark": { "type": "text", "align": "center", "dy": -15, "fontWeight": "bold", "color": "#e8a020" },
      "encoding": {
        "x": { "field": "year", "type": "ordinal", "sort": YEAR_ORDER },
        "y": { "field": "total_jobs_thousands", "type": "quantitative" },
        "text": { "field": "total_jobs_thousands", "type": "quantitative", "format": ",.0f" },
        "opacity": {
          "condition": {"param": "hover", "empty": false, "value": 1},
          "value": 0
        }
      }
    },
    {
      "data": { "values": [{ "year": "2020-21", "note": "COVID low: 377K" }] },
      "mark": { "type": "rule", "strokeDash": [4, 4], "color": CORAL, "strokeWidth": 1.5 },
      "encoding": {
        "x": { "field": "year", "type": "ordinal", "sort": YEAR_ORDER }
      }
    }
  ]
};

/* ================================================================
   CHART 6 — Grouped Bar: Domestic vs International GDP
   ================================================================ */
const chart6_dom_intl = {
  "$schema": "https://vega.github.io/schema/vega-lite/v6.json",
  "width": "container",
  "height": 280,
  "data": { "url": DATA_BASE + "domestic_vs_intl.csv" },
  "params": [{
    "name": "hover",
    "select": {"type": "point", "on": "mouseover"}
  }],
  "mark": { "type": "bar", "cornerRadiusTopLeft": 3, "cornerRadiusTopRight": 3, "cursor": "pointer" },
  "encoding": {
    "x": {
      "field": "year", "type": "ordinal",
      "sort": YEAR_ORDER,
      "axis": { "title": null, "labelAngle": -30, "labelFontSize": 11 }
    },
    "y": {
      "field": "gdp_m", "type": "quantitative",
      "axis": { "title": "Tourism GDP ($M)", "format": ",.0f", "labelFontSize": 11 }
    },
    "color": {
      "field": "type", "type": "nominal",
      "scale": {
        "domain": ["Domestic", "International"],
        "range": [TEAL, GOLD]
      },
      "legend": { "title": "Visitor Origin", "orient": "top-left" }
    },
    "opacity": {
      "condition": {"param": "hover", "empty": false, "value": 1},
      "value": 0.5
    },
    "xOffset": { "field": "type", "type": "nominal" },
    "tooltip": [
      { "field": "year", "type": "ordinal", "title": "Year" },
      { "field": "type", "type": "nominal", "title": "Type" },
      { "field": "gdp_m", "type": "quantitative", "title": "GDP ($M)", "format": ",.0f" }
    ]
  }
};

/* ================================================================
   CHART 7A — Bump Chart: International Market Ranking
   ================================================================ */
const chart_bump = {
  "$schema": "https://vega.github.io/schema/vega-lite/v6.json",
  "width": "container",
  "height": 280,
  "data": { "url": DATA_BASE + "intl_market_ranking.csv" },
  "mark": {"type": "line", "point": {"filled": true, "size": 100}, "strokeWidth": 3},
  "encoding": {
    "x": {
      "field": "Year", "type": "ordinal", 
      "sort": YEAR_ORDER,
      "axis": {"title": null, "labelAngle": -30, "labelFontSize": 11}
    },
    "y": {
      "field": "Rank", "type": "quantitative",
      "scale": {"domain": [5.5, 0.5]}, // Reverses the scale so Rank 1 is at top
      "axis": {"title": "Market Ranking", "tickCount": 5, "labelFontSize": 11}
    },
    "color": {
      "field": "Country", "type": "nominal",
      "scale": {
        "domain": ["China", "New Zealand", "USA", "UK", "India"],
        "range": [CORAL, TEAL, GOLD, NAVY, PURPLE]
      },
      "legend": {"orient": "bottom", "title": null}
    },
    "tooltip": [
      {"field": "Country", "type": "nominal", "title": "Market"},
      {"field": "Year", "type": "ordinal", "title": "Year"},
      {"field": "Rank", "type": "quantitative", "title": "Rank"}
    ]
  }
};

/* ================================================================
   CHART 7B — Radial Chart: Accommodation Types
   ================================================================ */
const chart_radial = {
  "$schema": "https://vega.github.io/schema/vega-lite/v6.json",
  "width": 240,
  "height": 240,
  "data": { "url": DATA_BASE + "accommodation_types.csv" },
  "params": [{
    "name": "hover",
    "select": {"type": "point", "on": "mouseover"}
  }],
  "mark": {"type": "arc", "innerRadius": 20, "stroke": "#fff", "strokeWidth": 1.5, "cursor": "pointer"},
  "encoding": {
    "theta": {"field": "Nights_000", "type": "quantitative"},
    "radius": {
      "field": "Accommodation", 
      "type": "nominal", 
      "legend": null
    },
    "color": {
      "field": "Accommodation", 
      "type": "nominal",
      "scale": {"range": [TEAL, GOLD, CORAL, NAVY, GREEN, PURPLE]},
      "legend": {
        "orient": "bottom",
        "title": null,
        "columns": 2,
        "labelFontSize": 10
      }
    },
    "opacity": {
      "condition": {"param": "hover", "empty": false, "value": 1},
      "value": 0.7
    },
    "tooltip": [
      {"field": "Accommodation", "type": "nominal", "title": "Type"},
      {"field": "Nights_000", "type": "quantitative", "title": "Nights ('000)", "format": ",.0f"}
    ]
  }
};



/* ================================================================
   CHART 8 — Concentric Symbol Map: Domestic vs Intl Spend
   ================================================================ */
const chart8_symbol_map = {
  "$schema": "https://vega.github.io/schema/vega-lite/v6.json",
  "width": "container",
  "height": 400,
  "projection": { "type": "mercator" },
  "layer": [
    {
      "data": {
        "url": DATA_BASE + "australia_states_simple.topojson",
        "format": { "type": "topojson", "feature": "states" }
      },
      "mark": { "type": "geoshape", "fill": "#e8f4f8", "stroke": "#8ecfdc", "strokeWidth": 1.2 }
    },
    {
      "data": {
        "values": [
          {"State": "New South Wales", "Lon": 147.0, "Lat": -32.5, "Domestic": 35000, "International": 11000, "TotalSpend": 46000},
          {"State": "Victoria", "Lon": 144.5, "Lat": -37.0, "Domestic": 26000, "International": 8400, "TotalSpend": 34400},
          {"State": "Queensland", "Lon": 144.0, "Lat": -22.0, "Domestic": 30000, "International": 6000, "TotalSpend": 36000},
          {"State": "Western Australia", "Lon": 121.5, "Lat": -25.5, "Domestic": 12000, "International": 2200, "TotalSpend": 14200},
          {"State": "South Australia", "Lon": 135.5, "Lat": -30.0, "Domestic": 8000, "International": 1100, "TotalSpend": 9100},
          {"State": "Tasmania", "Lon": 146.5, "Lat": -42.2, "Domestic": 3500, "International": 400, "TotalSpend": 3900},
          {"State": "Northern Territory", "Lon": 133.5, "Lat": -19.5, "Domestic": 2000, "International": 300, "TotalSpend": 2300},
          {"State": "Australian Capital Territory", "Lon": 149.1, "Lat": -35.5, "Domestic": 2500, "International": 200, "TotalSpend": 2700}
        ]
      },
      "transform": [
        { "fold": ["Domestic", "International"], "as": ["SpendType", "Amount"] }
      ],
      "params": [{
        "name": "hover",
        "select": {"type": "point", "on": "mouseover"}
      }],
      "mark": { "type": "circle", "stroke": "#ffffff", "strokeWidth": 0.5, "cursor": "pointer" },
      "encoding": {
        "longitude": { "field": "Lon", "type": "quantitative" },
        "latitude":  { "field": "Lat", "type": "quantitative" },
        "size": {
          "field": "Amount",
          "type": "quantitative",
          "scale": {
            "type": "sqrt",
            "domain": [0, 40000],
            "range": [0, 1500] // <--- DOTS ARE SMALLER HERE
          },
          "legend": { 
            "title": "Spend ($M)", 
            "format": "$,.0f", 
            "orient": "none", 
            "legendX": 94,  // <--- MOVED TO LEFT
            "legendY": 230, // <--- MOVED DOWN
            "titleFontSize": 10, "labelFontSize": 9 
          }
        },
        "color": {
          "field": "SpendType",
          "type": "nominal",
          "scale": {
            "domain": ["Domestic", "International"],
            "range": [TEAL, GOLD]
          },
          "legend": { 
            "title": "Market", 
            "orient": "none", 
            "legendX": 10,   // <--- MOVED TO LEFT
            "legendY": 330,  // <--- MOVED DOWN (UNDER THE OTHER LEGEND)
            "titleFontSize": 10, "labelFontSize": 9 
          }
        },
        "order": { "field": "Amount", "type": "quantitative", "sort": "descending" },
        "opacity": {
          "condition": {"param": "hover", "empty": false, "value": 1},
          "value": 0.85
        },
        "tooltip": [
          { "field": "State", "type": "nominal", "title": "State" },
          { "field": "SpendType", "type": "nominal", "title": "Market Segment" },
          { "field": "Amount", "type": "quantitative", "title": "Segment Spend ($M)", "format": "$,.0f" },
          { "field": "TotalSpend", "type": "quantitative", "title": "Total State Spend ($M)", "format": "$,.0f" }
        ]
      }
    }
  ]
};

/* ================================================================
   CHART 9 — Isotype Chart: Tourism Business Sizes (10x10 Grid)
   ================================================================ */
const chart9_donut = {
  "$schema": "https://vega.github.io/schema/vega-lite/v6.json",
  "width": 260,
  "height": 260,
  "title": {
    "text": "The Reality of Tourism",
    "subtitle": "1 dot = 1% of the industry",
    "anchor": "middle",
    "color": "#1a2e38",
    "fontSize": 20,
    "font": "'Playfair Display', serif"
  },
  // Generate 100 data points internally
  "data": { "sequence": { "start": 1, "stop": 101, "as": "id" } },
  "transform": [
    // Calculate the size distribution based on ABS 2025 data
    {
      "calculate": "datum.id <= 52 ? 'Micro (1-4)' : datum.id <= 86 ? 'Small (5-19)' : datum.id <= 99 ? 'Medium (20-199)' : 'Large (200+)'",
      "as": "Business Size"
    },
    // Mathematics to create a 10x10 grid layout
    { "calculate": "ceil(datum.id / 10)", "as": "row" },
    { "calculate": "datum.id - (datum.row - 1) * 10", "as": "col" }
  ],
  "params": [{
    "name": "hover",
    "select": {"type": "point", "on": "mouseover"}
  }],
  "mark": { "type": "circle", "size": 180, "cursor": "pointer" },
  "encoding": {
    "x": { "field": "col", "type": "ordinal", "axis": null },
    "y": { "field": "row", "type": "ordinal", "axis": null, "sort": "descending" },
    "color": {
      "field": "Business Size",
      "type": "nominal",
      "scale": {
        "domain": ["Micro (1-4)", "Small (5-19)", "Medium (20-199)", "Large (200+)"],
        "range": [TEAL, LIGHT, GOLD, CORAL]
      },
      "legend": { "title": null, "orient": "bottom" }
    },
    "opacity": {
      "condition": {"param": "hover", "empty": false, "value": 1},
      "value": 0.5
    },
    "tooltip": [
      { "field": "Business Size", "type": "nominal", "title": "Employment Size" }
    ]
  },
  "config": {
    "view": { "stroke": "transparent" }
  }
};

/* ================================================================
   CHART 10 — Context & Focus Bubble Chart: Productivity vs Jobs
   ================================================================ */
const chart10_bubble = {
  "$schema": "https://vega.github.io/schema/vega-lite/v6.json",
  "data": {
    "values": [
      { "industry": "Cafes & Restaurants",  "output": 21338, "jobs": 190.0, "category": "Food & Drink" },
      { "industry": "Air & Water Transport","output": 25642, "jobs": 40.1,  "category": "Transport" },
      { "industry": "Accommodation",        "output": 19889, "jobs": 105.6, "category": "Accommodation" },
      { "industry": "Travel Agencies",      "output": 9938,  "jobs": 14.6,  "category": "Services" },
      { "industry": "Clubs, Pubs & Bars",   "output": 8200,  "jobs": 40.8,  "category": "Food & Drink" },
      { "industry": "Sports & Recreation",  "output": 4352,  "jobs": 28.5,  "category": "Recreation" },
      { "industry": "Other Road Transport", "output": 4263,  "jobs": 37.7,  "category": "Transport" },
      { "industry": "Cultural Services",    "output": 3420,  "jobs": 13.6,  "category": "Culture" }
    ]
  },
  "transform": [
    { "filter": "datum.output > 0 && datum.jobs > 0" },
    { "calculate": "datum.output / datum.jobs", "as": "productivity" }
  ],
  "vconcat": [
    // --- TOP CHART (FOCUS / DETAIL) ---
    {
      "width": "container",
      "height": 280,
      "mark": { "type": "circle", "stroke": "white", "strokeWidth": 1, "cursor": "pointer" },
      "encoding": {
        "x": {
          "field": "productivity", 
          "type": "quantitative",
          "scale": {"domain": {"param": "brush"}},
          "axis": { "title": "Productivity ($M Output per 1,000 Jobs)", "labelFontSize": 11 }
        },
        "y": {
          "field": "jobs", 
          "type": "quantitative",
          "axis": { "title": "Main Jobs ('000)", "labelFontSize": 11 }
        },
        "size": {
          "field": "output", 
          "type": "quantitative",
          "scale": { "range": [100, 2000] },
          "legend": { 
            "title": "Total Output ($M)", 
            "format": "$,.0f", 
            "orient": "none",      // Detaches the legend
            "legendX": 1000,        // Moves it inside the chart area
            "legendY": 0,
            "fillColor": "rgba(255, 255, 255, 0.85)", // Semi-transparent background
            "padding": 10,
            "cornerRadius": 5
          }
        },
        "color": {
          "field": "category", 
          "type": "nominal",
          "scale": {
            "domain": ["Food & Drink","Transport","Accommodation","Services","Recreation","Culture"],
            "range": [TEAL, CORAL, GOLD, PURPLE, GREEN, LIGHT]
          },
          "legend": { 
            "title": "Category", 
            "orient": "none",      // Detaches the legend
            "legendX": 900,        // Places it right next to the Size legend
            "legendY": 0,
            "fillColor": "rgba(255, 255, 255, 0.85)",
            "padding": 10,
            "cornerRadius": 5
          }
        },
        "tooltip": [
          { "field": "industry", "type": "nominal", "title": "Industry" },
          { "field": "productivity", "type": "quantitative", "title": "Productivity", "format": "$,.0f" },
          { "field": "output", "type": "quantitative", "title": "Total Output ($M)", "format": "$,.0f" },
          { "field": "jobs", "type": "quantitative", "title": "Total Jobs ('000)", "format": ",.1f" }
        ]
      }
    },
    // --- BOTTOM CHART (CONTEXT / OVERVIEW MAP) ---
    {
      "width": "container",
      "height": 60,
      "params": [{
        "name": "brush",
        "select": {"type": "interval", "encodings": ["x"]}
      }],
      "mark": { "type": "circle", "stroke": "white", "strokeWidth": 0.5 },
      "encoding": {
        "x": {
          "field": "productivity", 
          "type": "quantitative",
          "axis": { "title": "Drag here to pan/zoom the chart above", "titleColor": "#1a8fa0", "titleFontWeight": "bold" }
        },
        "y": {
          "field": "jobs", 
          "type": "quantitative",
          "axis": { "tickCount": 3, "title": "Jobs" }
        },
        "size": {
          "field": "output", 
          "type": "quantitative",
          "scale": { "range": [2, 10] }, // smaller context bubbles
          "legend": null 
        },
        "color": {
          "field": "category", 
          "type": "nominal",
          "legend": null 
        }
      }
    }
  ],
  "config": {
    "concat": { "spacing": 20 } 
  }
};

/* ================================================================
   CHART 11 — Businesses Over Time (stacked bar)
   ================================================================ */
const chart11_biz_trend = {
  "$schema": "https://vega.github.io/schema/vega-lite/v6.json",
  "width": "container",
  "height": 250,
  "data": {
    "values": [
      { "year": "June 2020", "type": "Characteristic", "count": 194739 },
      { "year": "June 2020", "type": "Connected",      "count": 139850 },
      { "year": "June 2021", "type": "Characteristic", "count": 196182 },
      { "year": "June 2021", "type": "Connected",      "count": 149024 },
      { "year": "June 2022", "type": "Characteristic", "count": 203071 },
      { "year": "June 2022", "type": "Connected",      "count": 157465 },
      { "year": "June 2023", "type": "Characteristic", "count": 201313 },
      { "year": "June 2023", "type": "Connected",      "count": 157136 },
      { "year": "June 2024", "type": "Characteristic", "count": 204248 },
      { "year": "June 2024", "type": "Connected",      "count": 156785 },
      { "year": "June 2025", "type": "Characteristic", "count": 205101 },
      { "year": "June 2025", "type": "Connected",      "count": 156169 }
    ]
  },
  "params": [{
    "name": "hover",
    "select": {"type": "point", "on": "mouseover"}
  }],
  "mark": { "type": "bar", "cornerRadiusTopLeft": 3, "cornerRadiusTopRight": 3, "cursor": "pointer" },
  "encoding": {
    "x": {
      "field": "year", "type": "ordinal",
      "sort": ["June 2020","June 2021","June 2022","June 2023","June 2024","June 2025"],
      "axis": { "title": null, "labelFontSize": 11, "labelAngle": 0 }
    },
    "y": {
      "field": "count", "type": "quantitative",
      "stack": true,
      "axis": { "title": "Number of Businesses", "format": ",.0f", "labelFontSize": 11 }
    },
    "color": {
      "field": "type", "type": "nominal",
      "scale": {
        "domain": ["Characteristic", "Connected"],
        "range": [TEAL, LIGHT]
      },
      "legend": { "title": "Industry Type", "orient": "none", "legendX": 10, "legendY": -12}
    },
    "opacity": {
      "condition": {"param": "hover", "empty": false, "value": 1},
      "value": 0.7
    },
    "tooltip": [
      { "field": "year", "type": "ordinal", "title": "Year" },
      { "field": "type", "type": "nominal", "title": "Industry Type" },
      { "field": "count", "type": "quantitative", "title": "Businesses", "format": "," }
    ]
  }
};

/* ================================================================
   CHART 12 — Output by Industry (horizontal bar, 2024-25)
   ================================================================ */
const chart12_output = {
  "$schema": "https://vega.github.io/schema/vega-lite/v6.json",
  "width": "container",
  "height": 320,
  "data": {
    "values": [
      { "industry": "Air & Water Transport",   "output": 25642 },
      { "industry": "Cafes & Restaurants",     "output": 21338 },
      { "industry": "Accommodation",           "output": 19889 },
      { "industry": "Own. of Dwellings",       "output": 15549 },
      { "industry": "Travel Agencies",         "output": 9938 },
      { "industry": "Clubs, Pubs & Bars",      "output": 8200 },
      { "industry": "Sports & Recreation",     "output": 4352 },
      { "industry": "Other Road Transport",    "output": 4263 },
      { "industry": "Cultural Services",       "output": 3420 },
      { "industry": "Rail Transport",          "output": 2311 },
      { "industry": "Transport Rental",        "output": 2056 },
      { "industry": "Taxi/Rideshare",          "output": 2084 },
      { "industry": "Gambling Services",       "output": 748 }
    ]
  },
  "params": [{
    "name": "highlight",
    "select": {"type": "point", "on": "mouseover"}
  }],
  "mark": { "type": "bar", "cornerRadiusEnd": 4, "cursor": "pointer" },
  "encoding": {
    "y": {
      "field": "industry", "type": "nominal",
      "sort": { "field": "output", "order": "descending" },
      "axis": { "title": null, "labelFontSize": 11 }
    },
    "x": {
      "field": "output", "type": "quantitative",
      "axis": { "title": "Tourism Output ($M)", "format": ",.0f", "labelFontSize": 11 }
    },
    "color": {
      "condition": [
        { "test": "datum.industry === 'Air & Water Transport'", "value": CORAL },
        { "test": "datum.industry === 'Cafes & Restaurants'", "value": TEAL }
      ],
      "value": LIGHT
    },
    "opacity": {
      "condition": {"param": "highlight", "empty": false, "value": 1},
      "value": 0.4
    },
    "tooltip": [
      { "field": "industry", "type": "nominal", "title": "Industry" },
      { "field": "output", "type": "quantitative", "title": "Output ($M)", "format": ",.0f" }
    ]



  }
};




const chart_marimekko = {
  "$schema": "https://vega.github.io/schema/vega-lite/v6.json",
  "width": "container",
  "height": 300,
  "data": { "url": DATA_BASE + "gdp_by_visitor_type_formatted.csv" },
  "transform": [
    {
      "filter": "datum.Year !== 'Unnamed: 0' && !isNaN(+datum.GDP)"
    },
    {
      "joinaggregate": [{"op": "sum", "field": "GDP", "as": "TotalGDP"}],
      "groupby": ["Year"]
    }
  ],
  "mark": {"type": "bar", "stroke": "#fff", "strokeWidth": 0.5, "cursor": "pointer"},
  "encoding": {
    "x": {
      "field": "Year", "type": "ordinal",
      "sort": YEAR_ORDER,
      "axis": {"title": null, "labelAngle": -30}
    },
    // Width is determined by the total GDP of that year
    "width": {"field": "TotalGDP", "type": "quantitative", "scale": {"range": [80, 420]}},
    "y": {
      "field": "GDP", "type": "quantitative",
      "stack": "normalize", // Converts to percentage share
      "axis": {"title": "Share of Tourism GDP", "format": ".0%"}
    },
    "color": {
      "field": "Category", "type": "nominal",
      "scale": {"range": [TEAL, LIGHT, GOLD]},
      "legend": {"title": "Visitor Segment", "orient": "bottom"}
    },
    "tooltip": [
      {"field": "Year", "type": "ordinal"},
      {"field": "Category", "type": "nominal"},
      {"field": "GDP", "type": "quantitative", "format": ",.0f", "title": "GDP ($M)"}
    ]
  }
};


/* ================================================================
   CHART — Dumbbell Plot: Job Recovery by Industry
   ================================================================ */
const chart_dumbbell = {
  "$schema": "https://vega.github.io/schema/vega-lite/v6.json",
  "width": "container",
  "height": 320,
  "data": { "url": DATA_BASE + "industry_jobs_recovery.csv" },
  "encoding": {
    "y": {
      "field": "Industry",
      "type": "nominal",
      // Sorts the Y-axis so the industry with the most jobs is at the top
      "sort": {"op": "max", "field": "Jobs", "order": "descending"},
      "axis": {"title": null, "labelFontSize": 11, "grid": true}
    }
  },
  "layer": [
    // LAYER 1: The connecting line (the "bar" of the dumbbell)
    {
      "mark": {"type": "rule", "color": "#c8e0e8", "strokeWidth": 3},
      "encoding": {
        "x": {
          "aggregate": "min", "field": "Jobs", "type": "quantitative",
          "axis": {"title": "Tourism Main Jobs ('000)", "labelFontSize": 11}
        },
        "x2": {"aggregate": "max", "field": "Jobs"}
      }
    },
    // LAYER 2: The dots representing the specific years
    {
      "mark": {"type": "circle", "size": 200, "opacity": 1, "cursor": "pointer"},
      "encoding": {
        "x": {"field": "Jobs", "type": "quantitative"},
        "color": {
          "field": "Year",
          "type": "nominal",
          "scale": {
            "domain": ["2021 (COVID Low)", "2025 (Recovery)"],
            "range": [CORAL, TEAL] // Using your shared color constants
          },
          "legend": {"title": "Timeline", "orient": "bottom-right"}
        },
        // Adding the tooltip to Layer 2
        "tooltip": [
          {"field": "Industry", "type": "nominal", "title": "Industry"},
          {"field": "Year", "type": "nominal", "title": "Status"},
          {"field": "Jobs", "type": "quantitative", "title": "Jobs ('000)", "format": ",.1f"}
        ]
      }
    }
  ]
};




/* ================================================================
   RENDER ALL CHARTS
   ================================================================ */
const vegaOptions = {
  renderer: "svg",
  actions: false,
  theme: "none"
};

function renderChart(elementId, spec) {
  const el = document.getElementById(elementId);
  if (!el) return;
  vegaEmbed(`#${elementId}`, spec, vegaOptions)
    .catch(err => {
      console.error(`Error rendering ${elementId}:`, err);
      el.innerHTML = `<p style="color:#e05a40;padding:1rem">Chart failed to load. Ensure data files are on GitHub.</p>`;
    });
}

function renderSankey() {
  const el = document.getElementById("chart-sankey");
  if (!el) return;
  el.innerHTML = "";

  const margin = { top: 20, right: 20, bottom: 20, left: 20 };
  const width = 750 - margin.left - margin.right;
  const height = 380 - margin.top - margin.bottom;

  const svg = d3.select(el)
    .append("svg")
    .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .style("max-width", "100%");

  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  d3.csv(SANKY_DATA, d3.autoType).then(data => {
    const nodeNames = Array.from(new Set(data.flatMap(d => [d.source, d.destination])));
    const graph = {
      nodes: nodeNames.map(name => ({ name })),
      links: data.map(d => ({ source: d.source, target: d.destination, value: d.value }))
    };

    d3.sankey()
      .nodeId(d => d.name)
      .nodeWidth(15)
      .nodePadding(15)
      .extent([[0, 0], [width, height]])
      (graph);

    const color = d3.scaleOrdinal()
      .domain(graph.nodes.map(d => d.name))
      .range([TEAL, GOLD, CORAL, NAVY, GREEN, PURPLE, LIGHT]);

    g.append("g")
      .attr("fill", "none")
      .attr("stroke-opacity", 0.3)
      .selectAll("path")
      .data(graph.links)
      .join("path")
      .attr("d", d3.sankeyLinkHorizontal())
      .attr("stroke", d => color(d.source.name))
      .attr("stroke-width", d => Math.max(1, d.width))
      .on("mouseover", function() { d3.select(this).attr("stroke-opacity", 0.7); })
      .on("mouseout", function() { d3.select(this).attr("stroke-opacity", 0.3); })
      .append("title")
      .text(d => `${d.source.name} → ${d.target.name}: ${d.value}k visitors`);

    const node = g.append("g")
      .selectAll("g")
      .data(graph.nodes)
      .join("g");

    node.append("rect")
      .attr("x", d => d.x0)
      .attr("y", d => d.y0)
      .attr("height", d => Math.max(1, d.y1 - d.y0))
      .attr("width", d => Math.max(1, d.x1 - d.x0))
      .attr("fill", d => color(d.name))
      .attr("stroke", "#ffffff")
      .append("title")
      .text(d => `${d.name}\n${d.value}`);

    node.append("text")
      .attr("x", d => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
      .attr("y", d => (d.y0 + d.y1) / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
      .style("font-size", "11px")
      .style("fill", "#1a2e38")
      .text(d => d.name);
  }).catch(err => {
    console.error('Error rendering sankey chart:', err);
    el.innerHTML = `<p style="color:#e05a40;padding:1rem">Chart failed to load. Ensure data files are on GitHub.</p>`;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderSankey();
  renderChart("chart-choropleth",       chart1_choropleth);
  renderChart("chart-gdp-trend",        chart2_gdp_trend);
  renderChart("chart-marimekko",        chart_marimekko);
  renderChart("chart-jobs-industry",    chart4_jobs_industry);
  renderChart("chart-jobs-trend",       chart5_jobs_trend);
  renderChart("chart-dom-intl",         chart6_dom_intl);
  renderChart("chart-bump",             chart_bump);
  renderChart("chart-radial",           chart_radial);
  renderChart("chart-symbol-map",       chart8_symbol_map);
  renderChart("chart-donut",            chart9_donut);
  renderChart("chart-bubble",           chart10_bubble);
  renderChart("chart-biz-trend",        chart11_biz_trend);
  renderChart("chart-output",           chart12_output);
  renderChart("chart-dumbbell",         chart_dumbbell);
});