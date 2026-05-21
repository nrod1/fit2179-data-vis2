/* ============================================================
   FIT2179 Data Visualisation 2 — Australia Tourism
   All Vega-Lite & Vega chart specifications
   ============================================================ */

// GitHub raw base URL — UPDATE THIS with your GitHub username + repo
const DATA_BASE = "https://raw.githubusercontent.com/nrod1/fit2179-data-vis2/main/data/";

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
  "$schema": "https://vega.github.io/schema/vega/v5.json",
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
      "range": [TEAL, GOLD, CORAL, NAVY, GREEN, PURPLE, LIGHT]
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
        "text": { "field": "tourism_gdp_m", "type": "quantitative", "format": "$,.0f M" },
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
   CHART 7 — Line: International Visitor Consumption
   ================================================================ */
const chart7_intl_consumption = {
  "$schema": "https://vega.github.io/schema/vega-lite/v6.json",
  "width": "container",
  "height": 240,
  "data": { "url": DATA_BASE + "intl_visitor_consumption.csv" },
  "layer": [
    {
      "mark": { "type": "area", "interpolate": "monotone", "color": CORAL, "fillOpacity": 0.12, "line": true, "strokeWidth": 2.5 },
      "encoding": {
        "x": {
          "field": "year", "type": "ordinal",
          "sort": YEAR_ORDER,
          "axis": { "title": null, "labelAngle": -30, "labelFontSize": 11 }
        },
        "y": {
          "field": "consumption_m", "type": "quantitative",
          "axis": { "title": "Consumption ($M)", "format": ",.0f", "labelFontSize": 11 }
        },
        "color": { "value": CORAL }
      }
    },
    {
      "mark": { "type": "point", "filled": true, "size": 55, "color": CORAL, "tooltip": true },
      "encoding": {
        "x": { "field": "year", "type": "ordinal", "sort": YEAR_ORDER },
        "y": { "field": "consumption_m", "type": "quantitative" },
        "tooltip": [
          { "field": "year", "type": "ordinal", "title": "Year" },
          { "field": "consumption_m", "type": "quantitative", "title": "Consumption ($M)", "format": ",.0f" }
        ]
      }
    },
    {
      "mark": { "type": "text", "dy": -14, "fontSize": 9.5, "fontWeight": "bold", "color": CORAL },
      "transform": [{ "filter": "datum.year === '2024-25'" }],
      "encoding": {
        "x": { "field": "year", "type": "ordinal", "sort": YEAR_ORDER },
        "y": { "field": "consumption_m", "type": "quantitative" },
        "text": { "value": "$53.7B" }
      }
    }
  ]
};

/* ================================================================
   CHART 8 — Proportional Symbol Map: Business Density per State
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
      "mark": { "type": "geoshape", "fill": "#d6eef4", "stroke": "#8ecfdc", "strokeWidth": 1.2 }
    },
    {
      "data": {
        "values": [
          { "state": "New South Wales",             "lon": 147.0, "lat": -32.5, "businesses": 65838, "category": "Characteristic", "pct": 34 },
          { "state": "Victoria",                    "lon": 144.5, "lat": -37.0, "businesses": 59069, "category": "Characteristic", "pct": 30 },
          { "state": "Queensland",                  "lon": 144.0, "lat": -22.0, "businesses": 34181, "category": "Characteristic", "pct": 18 },
          { "state": "Western Australia",           "lon": 121.5, "lat": -25.5, "businesses": 17280, "category": "Characteristic", "pct": 9 },
          { "state": "South Australia",             "lon": 135.5, "lat": -30.0, "businesses": 10264, "category": "Characteristic", "pct": 5 },
          { "state": "Tasmania",                    "lon": 146.5, "lat": -42.2, "businesses": 3842,  "category": "Characteristic", "pct": 2 },
          { "state": "Australian Capital Territory","lon": 149.1, "lat": -35.5, "businesses": 2676,  "category": "Characteristic", "pct": 1 },
          { "state": "Northern Territory",          "lon": 133.5, "lat": -19.5, "businesses": 1479,  "category": "Characteristic", "pct": 1 }
        ]
      },
      "params": [{
        "name": "hover",
        "select": {"type": "point", "on": "mouseover"}
      }],
      "mark": { "type": "circle", "stroke": NAVY, "strokeWidth": 1, "cursor": "pointer" },
      "encoding": {
        "longitude": { "field": "lon", "type": "quantitative" },
        "latitude":  { "field": "lat", "type": "quantitative" },
        "size": {
          "field": "businesses",
          "type": "quantitative",
          "scale": {
            "type": "threshold",
            "domain": [5000, 15000, 40000],
            "range": [100, 400, 1200, 3000]
          },
          "legend": { "title": "Tourism Businesses", "format": ",.0f", "orient": "bottom-right" }
        },
        "color": { "value": TEAL },
        "opacity": {
          "condition": {"param": "hover", "empty": false, "value": 1},
          "value": 0.5
        },
        "tooltip": [
          { "field": "state", "type": "nominal", "title": "State" },
          { "field": "businesses", "type": "quantitative", "title": "Tourism Businesses (Char.)", "format": "," },
          { "field": "pct", "type": "quantitative", "title": "% of National Total", "format": ".0f" }
        ]
      }
    }
  ]
};

/* ================================================================
   CHART 9 — Donut / Arc: Business type split (2025)
   ================================================================ */
const chart9_donut = {
  "$schema": "https://vega.github.io/schema/vega-lite/v6.json",
  "width": 260,
  "height": 260,
  "data": {
    "values": [
      { "type": "Tourism Characteristic\nIndustries",  "count": 205101 },
      { "type": "Tourism Connected\nIndustries",       "count": 156169 }
    ]
  },
  "params": [{
    "name": "hover",
    "select": {"type": "point", "on": "mouseover"}
  }],
  "mark": { "type": "arc", "innerRadius": 80, "padAngle": 0.02, "cornerRadius": 4, "cursor": "pointer" },
  "encoding": {
    "theta": { "field": "count", "type": "quantitative" },
    "color": {
      "field": "type", "type": "nominal",
      "scale": { "range": [TEAL, GOLD] },
      "legend": { "title": null, "orient": "bottom", "labelFontSize": 11 }
    },
    "opacity": {
      "condition": {"param": "hover", "empty": false, "value": 1},
      "value": 0.6
    },
    "tooltip": [
      { "field": "type", "type": "nominal", "title": "Category" },
      { "field": "count", "type": "quantitative", "title": "Businesses", "format": "," }
    ]
  }
};

/* ================================================================
   CHART 10 — Scatter/Bubble: Output vs Jobs by Industry (2024-25)
   ================================================================ */
const chart10_bubble = {
  "$schema": "https://vega.github.io/schema/vega-lite/v6.json",
  "width": "container",
  "height": 320,
  "data": {
    "values": [
      { "industry": "Cafes & Restaurants",  "output": 21338, "jobs": 190.0, "category": "Food & Drink" },
      { "industry": "Air & Water Transport","output": 25642, "jobs": 40.1,  "category": "Transport" },
      { "industry": "Accommodation",        "output": 19889, "jobs": 105.6, "category": "Accommodation" },
      { "industry": "Own. of Dwellings",    "output": 15549, "jobs": 0,     "category": "Property" },
      { "industry": "Travel Agencies",      "output": 9938,  "jobs": 14.6,  "category": "Services" },
      { "industry": "Retail Trade",         "output": 0,     "jobs": 116.8, "category": "Retail" },
      { "industry": "Clubs, Pubs & Bars",   "output": 8200,  "jobs": 40.8,  "category": "Food & Drink" },
      { "industry": "Sports & Recreation",  "output": 4352,  "jobs": 28.5,  "category": "Recreation" },
      { "industry": "Other Road Transport", "output": 4263,  "jobs": 37.7,  "category": "Transport" },
      { "industry": "Cultural Services",    "output": 3420,  "jobs": 13.6,  "category": "Culture" },
      { "industry": "Education & Training", "output": 0,     "jobs": 35.0,  "category": "Services" },
      { "industry": "Transport Rental",     "output": 2056,  "jobs": 0,     "category": "Transport" }
    ]
  },
  "params": [
    {
      "name": "Category_selection",
      "bind": {
        "input": "select",
        "options": [null, "Food & Drink", "Transport", "Accommodation", "Services", "Recreation", "Culture"],
        "labels": ["Show All", "Food & Drink", "Transport", "Accommodation", "Services", "Recreation", "Culture"],
        "name": "Industry Category: "
      }
    },
    {
      "name": "hover",
      "select": {"type": "point", "on": "mouseover", "clear": "mouseout"}
    }
  ],
  "transform": [
    { "filter": "datum.output > 0 && datum.jobs > 0" },
    { "filter": "Category_selection == null || datum.category == Category_selection" }
  ],
  "mark": { "type": "circle", "stroke": "white", "strokeWidth": 1, "cursor": "pointer" },
  "encoding": {
    "x": {
      "field": "output", "type": "quantitative",
      "axis": { "title": "Industry Output ($M)", "format": ",.0f", "labelFontSize": 11 }
    },
    "y": {
      "field": "jobs", "type": "quantitative",
      "axis": { "title": "Main Jobs ('000)", "labelFontSize": 11 }
    },
    "size": {
      "field": "output", "type": "quantitative",
      "scale": { "range": [80, 1800] },
      "legend": null
    },
    "color": {
      "field": "category", "type": "nominal",
      "scale": {
        "domain": ["Food & Drink","Transport","Accommodation","Services","Recreation","Culture"],
        "range": [TEAL, CORAL, GOLD, PURPLE, GREEN, LIGHT]
      },
      "legend": { "title": "Category", "orient": "top-right" }
    },
    "opacity": {
      "condition": {"param": "hover", "empty": false, "value": 1},
      "value": 0.6
    },
    "tooltip": [
      { "field": "industry", "type": "nominal", "title": "Industry" },
      { "field": "output", "type": "quantitative", "title": "Output ($M)", "format": ",.0f" },
      { "field": "jobs", "type": "quantitative", "title": "Jobs ('000)", "format": ".1f" }
    ]
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
      "axis": { "title": null, "labelFontSize": 11 }
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
      "legend": { "title": "Industry Type", "orient": "top-left" }
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

document.addEventListener("DOMContentLoaded", () => {
  renderChart("chart-sankey",           chart0_sankey);
  renderChart("chart-choropleth",       chart1_choropleth);
  renderChart("chart-gdp-trend",        chart2_gdp_trend);
  renderChart("chart-visitor-type",     chart3_visitor_type);
  renderChart("chart-jobs-industry",    chart4_jobs_industry);
  renderChart("chart-jobs-trend",       chart5_jobs_trend);
  renderChart("chart-dom-intl",         chart6_dom_intl);
  renderChart("chart-intl-consumption", chart7_intl_consumption);
  renderChart("chart-symbol-map",       chart8_symbol_map);
  renderChart("chart-donut",            chart9_donut);
  renderChart("chart-bubble",           chart10_bubble);
  renderChart("chart-biz-trend",        chart11_biz_trend);
  renderChart("chart-output",           chart12_output);
});