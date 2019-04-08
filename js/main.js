const SVG_WIDTH = 1700;
const SVG_HEIGHT = 1000;

const svg = d3.select('body').append('svg');
svg.attr("width", SVG_WIDTH)
.attr("height", SVG_HEIGHT);

const bg = svg.append("rect")
.attr("id", "bg")
.attr("width", "100%")
.attr("height", "100%");

let TOPIC_HEIGHT = 50; // gap between topics. TODO: set dynamically based on # of topics
let GRAPH_Y = 50; // start of graph


const MODEL_A_X = 710;
const MODEL_B_X = 985;

let TOPIC_SHIFT_Y = 0;


const ONTO_X = Math.floor(MODEL_A_X/2 + MODEL_B_X/2);
const ONTO_Y = GRAPH_Y; // start y for ontology
const ONTO_HEIGHT = 38; // pixel y height for each concept
// const ONTO_TOPIC_HEIGHT = TOPIC_HEIGHT; // pixel y height for each concept

const MODEL_A_TOPIC_TEXT_X = MODEL_A_X - 530;
const MODEL_B_TOPIC_TEXT_X = MODEL_B_X + 25;
const TOPIC_TEXT_Y = GRAPH_Y - 42;

let HEATMAP_DOCTOPIC_X_A = SVG_WIDTH/2 - 700 
let HEATMAP_DOCTOPIC_X_B = SVG_WIDTH/2 + 600;
let HEATMAP_DOCTOPIC_Y =  280;
let HEATMAP_DOCTOPIC_GRID_SIZE = 20; // grid width in pixels
let ALIGNMENT_HEATMAP_GRID_SIZE = 40; // grid width in pixels
let TOPICSELECT_HEATMAP_GRID_SIZE = 40; // grid width in pixels


let DOCUMENT_TEXT_Y = 600;

let num_documents; // number of documents
let selected_doc_name; // selected document name

const COLOR_MODEL_A = "#a81a2d";
const COLOR_MODEL_B = "#184dc0";
const COLOR_MODEL_WHITE = "#aaaaaa";
const COLOR_MODEL_BLACK = "#444444";
const COLOR_SELECT =  "#FB0";

const COLOR_LEFT_HOVER = "rgb(231, 152, 3)";
const COLOR_RIGHT_HOVER = "rgb(44, 122, 238)";
const COLOR_LEFT_CLICKED = "rgb(187, 73, 20)";
const COLOR_RIGHT_CLICKED = "rgb(3, 75, 231)";

const COLOR_RED_SCALE = d3.scaleSequential(d3.interpolateReds);
const COLOR_GREEN_SCALE = d3.scaleSequential(d3.interpolateGreens);
let COLOR_BLUE_SCALE = d3.scaleSequential(d3.interpolateBlues);


const FADE_IN_TIME = 200; // transition fade time in ms
const FADE_OUT_TIME = 600;

const TOPIC_SELECT_TRANSITION_TIME = 200;
let FLAG_TOPIC_SELECT_FIXED = false; // if true, fix the topic select position
const TOPIC_SELECT_FIXED = {
  "A" : {
    x : 500,
    y : 540
  },
  "B" : {
    x : 990,
    y : 540
  }
}

// // readjust for k3_10
// const TOPIC_SELECT_FIXED = {
//   "A" : {
//     x : 320,
//     y : 580
//   },
//   "B" : {
//     x : 1050,
//     y : 580
//   }
// }
const TOPIC_SELECT_DYNAMIC = {
  "A" : {
    x : 290
  },
  "B" :{
    x : 1220
  }
}

const buddy_x_min = 280;
const buddy_B_x = 1400;
const buddy_x_width = 180;
const buddy_y_min = HEATMAP_DOCTOPIC_Y - HEATMAP_DOCTOPIC_GRID_SIZE/2;
const buddy_y_gap = HEATMAP_DOCTOPIC_GRID_SIZE;

const buddy_color_scale_AB = d3.scaleLinear()
.range([COLOR_MODEL_WHITE, COLOR_MODEL_BLACK])
.interpolate(d3.interpolateLab);

const buddy_color_scale_BA = d3.scaleLinear()
.range([COLOR_MODEL_BLACK, COLOR_MODEL_WHITE])
.interpolate(d3.interpolateLab);

let data; // sadly we have to make data global to make the interactions work bw doctopics + docview. otherwise it would be nicer without this
let FLAG_REDACT_DOCUMENT_TEXT = true; //redact document text by default

let data_sample = {
  dir: "sample",
  file_prefix: "k1",
  model_a_name: "lda",
  model_b_name: "nmf",
  doc_start: 0,
  doc_end: 3,
  ontology_map: "umls_r.json",
  ontology_names: "name_dict.json",

  vis_parameters: {
    topic_rescale: 0.05,
    n_top_keywords: 5,
    heatmap_doctopic_grid_size: 35,
    redact_document_text: false,
  }
};

let data_kendall1 = {
  dir: "kendall1",
  file_prefix: "k1",
  model_a_name: "lda",
  model_b_name: "nmf",
  doc_start: 0,
  doc_end: 31,
  ontology_map: "umls_r.json",
  ontology_names: "name_dict.json",
  vis_parameters: {
    topic_rescale: 1,
    n_top_keywords: 10,
  }

};

let data_kendall2 = {
  dir: "kendall2",
  file_prefix: "k2",
  model_a_name: "lda",
  model_b_name: "nmf",
  doc_start: 32,
  doc_end: 56,
  ontology_map: "umls_r.json",
  ontology_names: "name_dict.json",
  vis_parameters: {
    topic_rescale: 0.5,
    n_top_keywords: 10,
  }    


};

let data_kendall3 = {
  dir: "kendall3",
  file_prefix: "k3",
  model_a_name: "lda",
  model_b_name: "nmf",
  doc_start: 57,
  doc_end: 90,
  ontology_map: "umls_r.json",
  ontology_names: "name_dict.json",
  vis_parameters: {
    topic_rescale: 1,
    n_top_keywords: 30,
  }
};

// topic_height = 25
let data_kendall3_10 = {
  dir: "kendall3_10",
  file_prefix: "k3",
  model_a_name: "lda",
  model_b_name: "nmf",
  doc_start: 57,
  doc_end: 90,
  ontology_map: "umls_r.json",
  ontology_names: "name_dict.json",

  vis_parameters: {
    graph_y: 40,
    topic_rescale: 0.8,
    topic_shift_y: 10,
    n_top_keywords: 30,
    topic_height: 25,
    alignment_heatmap_grid_size: 25,
    topicselect_heatmap_grid_size: 35,
    heatmap_doctopic_x_a: 70,
    document_text_y: 650,
    on_load: ()=>{
      // move topicselect to fixed position
      FLAG_TOPIC_SELECT_FIXED = true;
  
      ["A", "B"].forEach(model=> {
        d3.select(".topicselect."+model)
          .transition()
            .duration(TOPIC_SELECT_TRANSITION_TIME)
            .ease(d3.easeSin)
            .attr("transform", translateString(TOPIC_SELECT_FIXED[model].x, TOPIC_SELECT_FIXED[model].y));
      });
    },
  },

};

let data_cancer5 = {
  dir: "cancer5",
  wordtopics_name: "word_topic_47_distr",
  doctopics_name: "doc_topic_47_distr",
  model_a_name: "lda5",
  model_b_name: "nmf5",
  texts_csv: "csn_47.csv",
  ontology_map: "umls_r_csn.json",
  ontology_names: "name_dict.json",
  vis_parameters: {
    topic_rescale: 0.7,
    n_top_keywords: 100,
    rescale_B_max: 0.05,
  }
};

let data_cancer10 = {
  dir: "cancer10",
  wordtopics_name: "word_topic_47_distr",
  doctopics_name: "doc_topic_47_distr",
  model_a_name: "lda10",
  model_b_name: "nmf10",
  texts_csv: "csn_47.csv",
  ontology_map: "umls_r_csn.json",
  ontology_names: "name_dict.json",
  vis_parameters: {
    graph_y: 40,
    topic_rescale: 0.4,
    topic_shift_y: 10,
    n_top_keywords: 300,
    rescale_B_max: 0.05,
    topic_height: 25,
    alignment_heatmap_grid_size: 25,
    topicselect_heatmap_grid_size: 35,
    heatmap_doctopic_x_a: 70,
    document_text_y: 650,
    on_load: ()=>{
      // move topicselect to fixed position
      FLAG_TOPIC_SELECT_FIXED = true;
  
      ["A", "B"].forEach(model=> {
        d3.select(".topicselect."+model)
          .transition()
            .duration(TOPIC_SELECT_TRANSITION_TIME)
            .ease(d3.easeSin)
            .attr("transform", translateString(TOPIC_SELECT_FIXED[model].x, TOPIC_SELECT_FIXED[model].y));
      });
    },
  },
};

// globalize metadata so that we can have separate pages to load each
datasets = {
  sample: data_sample,
  k1: data_kendall1,
  k2: data_kendall2,
  k3: data_kendall3,
  k3_10: data_kendall3_10,
  c5: data_cancer5,
  c10: data_cancer10,
};

async function main(metadata) {
  
  // data = await init_data(data_sample);
  // data = await init_data(data_kendall1); // use the global data TODO: rescope with interactions
  // data = await init_data(data_kendall2);
  // data = await init_data(data_kendall3);
  data = await init_data(metadata);
  console.log("data", data);

  // compute reweighted topics based on top N words to show in document
  const N_TOP_KEYWORDS = data.vis_parameters.n_top_keywords; // only show top 10 words per topic


  // update metadata constants (TODO: prevent copy paste by using js object to store changeable constants)
  if (typeof data.vis_parameters.graph_y !== 'undefined') {
    GRAPH_Y = data.vis_parameters.graph_y;
  }

  if (typeof data.vis_parameters.topic_height !== 'undefined') {
    TOPIC_HEIGHT = data.vis_parameters.topic_height;
  }

  if (typeof data.vis_parameters.topic_shift_y !== 'undefined') {
    TOPIC_SHIFT_Y = data.vis_parameters.topic_shift_y;
  }

  if (typeof data.vis_parameters.heatmap_doctopic_grid_size !== 'undefined') {
    HEATMAP_DOCTOPIC_GRID_SIZE = data.vis_parameters.heatmap_doctopic_grid_size;
  }

  if (typeof data.vis_parameters.alignment_heatmap_grid_size !== 'undefined') {
    ALIGNMENT_HEATMAP_GRID_SIZE = data.vis_parameters.alignment_heatmap_grid_size;
  }

  if (typeof data.vis_parameters.topicselect_heatmap_grid_size !== 'undefined') {
    TOPICSELECT_HEATMAP_GRID_SIZE = data.vis_parameters.topicselect_heatmap_grid_size;
  }

  if (typeof data.vis_parameters.heatmap_doctopic_x_a !== 'undefined') {
    HEATMAP_DOCTOPIC_X_A = data.vis_parameters.heatmap_doctopic_x_a;
  }
  
  if (typeof data.vis_parameters.document_text_y !== 'undefined') {
    DOCUMENT_TEXT_Y = data.vis_parameters.document_text_y;
  }


  // adjust color scale if need be:
  if (typeof data.vis_parameters.rescale_B_max !== 'undefined') {
      COLOR_BLUE_SCALE = d3.scaleSequential(d3.interpolateBlues)
        .domain([0, data.vis_parameters.rescale_B_max]);

  }

  if (typeof data.vis_parameters.redact_document_text !== 'undefined') {
    FLAG_REDACT_DOCUMENT_TEXT = data.vis_parameters.redact_document_text;
  }

  

  // fill names and reweight topic freqs  
  data.topics.reweight = {};
  data.topics.reweight.A = data.topics.A.map(topic=>reweightTopicTopWords(topic, N_TOP_KEYWORDS));
  data.topics.reweight.B = data.topics.B.map(topic=>reweightTopicTopWords(topic, N_TOP_KEYWORDS));

  // top ontology concepts
  const N_TOP_CONCEPTS = 10;

  data.onto.top_concepts = filterTopConcepts(data.onto.concepts, N_TOP_CONCEPTS);
  console.log(data.onto.top_concepts);

  drawTopicHints(data.topics.A.length, data.topics.B.length);
  drawTopics(data.topics.A, data.topics.B, data.model_names, data.vis_parameters.topic_rescale, 7, TOPIC_SHIFT_Y);
  // globalize selections
  // let g_graph, g_graph_links, g_graph_nodes;  
  drawAlignment(data.model_names, data.topics.A, data.topics.B, data.alignment);
  drawAlignmentHeatMap(data.alignment, data.model_names);
  drawSegregation(data.segregation.A, data.segregation.B);
  drawDocTopicHeatMap(data.doctopics.A, "left");
  drawDocTopicHeatMap(data.doctopics.B, "right");
  drawTopicSelectHeatMaps(data.doctopics.A, data.doctopics.B);
  drawDocumentText();
  drawOntology(data.onto.top_concepts, data.topics);
  drawBuddyPlots(data.docsims.A, data.docsims.B, buddy_x_min, buddy_x_width, buddy_color_scale_AB);
  drawBuddyPlots(data.docsims.B, data.docsims.A, buddy_B_x, -buddy_x_width, buddy_color_scale_BA); // reverse left-right, reverse colors

  drawControls();

  // do any initial function
  if (typeof data.vis_parameters.on_load !== 'undefined') {
    data.vis_parameters.on_load();
  }

  // console.log(data_vocab);
  
};

// main(data_sample);


function drawControls() {
  const CONTROLS_X = 20;
  const CONTROLS_Y = 20;
  const CONTROLS_WIDTH = 240;
  const CONTROLS_HEIGHT = 180;
    
  const controls = svg.append("g")
    .attr("id", "controls")
    .attr("transform", translateString(CONTROLS_X, CONTROLS_Y));

  controls.append("rect")
    .attr("width", CONTROLS_WIDTH)
    .attr("height", CONTROLS_HEIGHT)
    .attr("rx", 15)
    .attr("ry", 15)

  // const controls_div = controls.append("foreignObject")
  //   .attr("class", "fo") 
  //   .attr("width", CONTROLS_WIDTH)
  //   .attr("height", CONTROLS_HEIGHT)
  // .append("xhtml:div")
  //   .style("height", CONTROLS_HEIGHT)
  //   .html("");

  // controls_div.append("xhtml:input")
  //   .attr("type", "checkbox")
  //   .attr("id", "segregation")
  //   .html("toggle topic segregation");

  // controls_div.append(d3.select("#test"));

  drawToggleBox(controls, 10, 10, "segregation", "show topic segregation", true, (_,i,nodes) => {
    toggleSelection(d3.select(nodes[i]), d3.select("#segregation"));
  });
  drawToggleBox(controls, 10, 40, "ontology", "toggle ontology/alignment", false, (_,i,nodes)=>{
    const checkbox = d3.select(nodes[i]);

    const alignment_graph = d3.select("#graph-alignment");
    const onto_graph = d3.select("#graph-ontology");
    const alignment_heatmap = d3.select("#heatmap-alignment");

    if (checkbox.property("checked")) {
      hideSelection(alignment_graph);
      hideSelection(alignment_heatmap);

      showSelection(onto_graph, FADE_IN_TIME);
    } else {
      hideSelection(onto_graph);
      showSelection(alignment_graph, FADE_IN_TIME);
      showSelection(alignment_heatmap, FADE_IN_TIME);
    }
  });

  drawToggleBox(controls, 10, 70, "buddy", "show buddy plots", false, (_,i,nodes)=>{
    d3.selectAll(".buddyplots").each((_,j,ns)=> { // this is callback hell. instead of doing this, please just make a toggleSelections function that does each
      toggleSelection(d3.select(nodes[i]), d3.select(ns[j]));
    });

    const checkbox = d3.select(nodes[i]);

    if (checkbox.property("checked")) {
      // move topicselect to fixed position
      FLAG_TOPIC_SELECT_FIXED = true;

      ["A", "B"].forEach(model=> {
        d3.select(".topicselect."+model)
          .transition()
            .duration(TOPIC_SELECT_TRANSITION_TIME)
            .ease(d3.easeSin)
            .attr("transform", translateString(TOPIC_SELECT_FIXED[model].x, TOPIC_SELECT_FIXED[model].y));
      });

    } else {
      // move topicselect to dynamic position
      FLAG_TOPIC_SELECT_FIXED = false;

      const row = parseInt(selected_doc_name.slice(1), 10) - 1; // 0-indexed row from stored class name
      const y = row * HEATMAP_DOCTOPIC_GRID_SIZE + HEATMAP_DOCTOPIC_Y;

      ["A", "B"].forEach(model=> {
        d3.select(".topicselect."+model)
          .transition()
            .duration(TOPIC_SELECT_TRANSITION_TIME)
            .ease(d3.easeSin)
            .attr("transform", translateString(TOPIC_SELECT_DYNAMIC[model].x, y));
      });

    }


  });

}

function drawToggleBox(parent, x, y, id, label, start_checked, on_toggle) {
  const X_OFFSET = 20;
  const Y_OFFSET_TEXT = 10; // text needs offset for no good reason

  const g = parent.append("g")
    .attr("class", "toggle "+id)
    .attr("transform", translateString(x,y))
  const checkbox = g.append("foreignObject")
      .attr("class", "fo") 
      .attr("height", 20)
      .attr("width", 20)
    .append("xhtml:input")
      .attr("type", "checkbox")
      .property("checked", start_checked)
      .on("change", on_toggle);

  // label
  g.append("text")
    .attr("class", "label noselect")
    .attr("alignment-baseline", "middle")
    .attr("x", X_OFFSET)
    .attr("y", Y_OFFSET_TEXT)
    .text(label);
}

function toggleSelection(checkbox, selection) {
  if (checkbox.property("checked")) {
    showSelection(selection, 0);
  } else {
    hideSelection(selection);
  }
}

function hideSelection(selection) {
  selection
      .attr("opacity", 1) // set opacity to 1 if it hasn't ever been set to prevent first time jitter
      .classed("notouch", true) // disable mouse events
    .transition()
      .duration(FADE_IN_TIME)
      .attr("opacity", 0);
}

function showSelection(selection, delay_ms) {
  selection
      .classed("notouch", false) // enable mouse events
    .transition()
      .delay(delay_ms)
      .duration(FADE_IN_TIME)
      .attr("opacity", 1);
}







// -----
// topic vis (keywords)
// -----


// mapping from topic keywords checkerboard

function drawTopicHints(num_topics_a, num_topics_b) {
  const hints = svg.append("g")
    .attr("id", "topichints");

  const hints_model_A = hints.append("g")
    .attr("class", "A");
  const hints_model_B = hints.append("g")
    .attr("class", "B");


  // TODO: replace hard code with displacement from topic constants
  const hints_A_x0 = HEATMAP_DOCTOPIC_X_A - 2;
  const hints_B_x0 = 957;
  // const hints_B_x0 = 877;
  const hints_y0 = 26;
  // const hints_y1 = 140+250;

  const hints_A_w = MODEL_A_X - HEATMAP_DOCTOPIC_X_A + 30;
  const hints_B_w = 515;
  const hints_h = 250;

  const hints_dx = HEATMAP_DOCTOPIC_GRID_SIZE;
  const hints_dy = TOPIC_HEIGHT;

  const hints_rx = 20;
  const hints_opacity = 0.15;


  let x = hints_A_x0;
  let y = hints_y0;
  let w = hints_A_w;
  let h = hints_h;

  for (let i=0; i<num_topics_a; i++) {
    hints_model_A.append("rect")
      .attr("x", x)
      .attr("y", y)
      .attr("width", w)
      .attr("height", h)
      .attr("rx", hints_rx)
      .attr("fill", (i % 2 == 0)? COLOR_MODEL_A : "white")
      .attr("opacity", (i % 2 == 0)? hints_opacity : 1-3*hints_opacity);

    x += hints_dx;
    w -= hints_dx;
    y += hints_dy;
    h -= hints_dy;
  }
  
  // do in reverse order
  x = hints_B_x0;
  y = hints_y0;
  w = hints_B_w;
  h = hints_h;
  for (let i=0; i<num_topics_b; i++) {
    hints_model_B.append("rect")
      .attr("x", x)
      .attr("y", y)
      .attr("width", w)
      .attr("height", h)
      .attr("rx", hints_rx)
      .attr("fill", (i % 2 == 0)? COLOR_MODEL_B : "white")
      .attr("opacity", (i % 2 == 0)? hints_opacity : 1-3*hints_opacity);

    w += hints_dx;
    y += hints_dy;
    h -= hints_dy;
  }
}

function drawTopic(parent, topic, model_name, x, y, rescale=1, align="left") {
  const topic_width = 300; // scale dynamically
  // const topic_height = TOPIC_HEIGHT;
  
  // TODO: rescale each within topic? to fit 5 words within? but then no relative
  // calculate dynamically based on longest topic words?
  
  const WORD_SCALE_FACTOR = 2200; // word font-size = word.freq * SCALE_FACTOR
  const WORD_PAD = 10; // pixels gap between words

  // clamp val between min and max so that we don't get huge or small words
  function clamp(val, min, max) {
    if (val < min) return min;
    if (val > max) return max;
    return val;
  }
  
  const g_topic = parent.append("g")
  .attr("class", "topic " + model_name)
  .attr("id", topic.name)
  .attr("transform", translateString(x, y));
  // .data(topic.words);
  
  // g_topic.append("rect")
  //   .attr("width", topic_width)
  //   .attr("height", topic_height)
  //   .attr("fill", "none")
  //   .attr("stroke", "#aaa")
  //   .attr("stroke-width", 5);
  
  const word = g_topic.selectAll("g")
  .data(topic.words)
  .enter().append("g")
  .attr("class", "word noselect")
  .attr("transform", d=>translateString(0, TOPIC_HEIGHT)); // old: d.cum_width*topic_width, topic_height
  
  const word_text = word.append("text")
  .text(d=>d.word)
  .attr("font-size", d=>clamp(d.freq * WORD_SCALE_FACTOR * rescale, 14, 40))
  .attr("font-family", "'Lato', sans-serif;")
  .attr("fill", (model_name === "A")? COLOR_MODEL_A : COLOR_MODEL_B); // TODO: replace lda with A/B
  
  // position each word horizontally after one another
  let word_x = 0;
  word_text.each(function (d) {
    const word = d3.select(this);
    d.x = word_x;
    word.attr("x", d=>d.x);
    
    word_x += word.node().getComputedTextLength() + WORD_PAD;
  });
  
  // right align
  if (align === "right") {
    g_topic.each(function (d) {
      const topic = d3.select(this);
      const width = topic.node().getBoundingClientRect().width;
      
      topic.attr("transform", d=>translateString(500-width+x, y));      
      
      // console.log(width);   
    })
  }
  
}

function drawTopics(topics_A, topics_B, model_names, topic_rescale, n_words, shift_y=0) {

  const N_WORDS = n_words //show top 5 words
  // const NUM_TOPICS_A = topics_A.length;
  // const NUM_TOPICS_B = topics_B.length;
  
  // const is_left = (model === "A");
  
  const g_topics = svg.append("g")
    .attr("id", "topics");

  const g_labels = g_topics.append("g")
    .attr("class", "topic labels");

  g_labels.append("text")
    // .text("model A: " + model_names.A)
    .text("model A")
    .attr("x", MODEL_A_X - 300)
    .attr("y", 20)
    .attr("font-size", 20)
    .attr("font-weight", "bold")
    .attr("fill", COLOR_MODEL_A)

  g_labels.append("text")
    // .text("model B: " + model_names.B)
    .text("model B")
    .attr("x", MODEL_B_X + 150)
    .attr("y", 20)
    .attr("font-size", 20)
    .attr("font-weight", "bold")
    .attr("fill", COLOR_MODEL_B)

  g_labels.append("g")
    .attr("class", "A")
    .selectAll("text")
    .data(topics_A)
      .enter().append("text")
    .text((_, i)=> "A"+(i+1).toString())
    .attr("x", MODEL_A_X + 15)
    .attr("y", (_, i) => GRAPH_Y + i*TOPIC_HEIGHT - 2)
    .attr("fill", COLOR_MODEL_A)
    .attr("text-anchor", "start");


  g_labels.append("g")
    .attr("class", "B")
    .selectAll("text")
    .data(topics_B)
      .enter().append("text")
    .text((_, i)=> "B"+(i+1).toString())
    .attr("x", MODEL_B_X - 15)
    .attr("y", (_, i) => GRAPH_Y + i*TOPIC_HEIGHT - 2)
    .attr("fill", COLOR_MODEL_B)
    .attr("text-anchor", "end");

  
  function filterTopics(topics) {
    let filtered_topics = []

    topics.forEach((topic, i)=>{
      // console.log(filterTopWords(topic, 5));
      
      const filtered_topic = {
        name: topic.name,
        words: filterTopWords(topic, N_WORDS)
      };
  
      // sum up the freq of top words so we can normalize
      filtered_topic.sum_words = filtered_topic.words.reduce((sum, word) => sum + word.freq, 0);
      filtered_topics.push(filtered_topic);
    });

    return filtered_topics;
  }

  let filtered_topics_A = filterTopics(topics_A);
  let filtered_topics_B = filterTopics(topics_B);

  // console.log(filtered_topics_A, filtered_topics_B);

  // compute rescale factors to normalize text size for topics (prevents huge and tiny words)
  let filtered_median = median(
    filtered_topics_A.concat(filtered_topics_B)
      .map(topic=>topic.sum_words));

  // console.log(filtered_median);

  // console.log(filtered_topics);

  filtered_topics_A.forEach((topic, i)=> {
    let rescale = topic_rescale * filtered_median / topic.sum_words; // rescale factor based on inverted sum/median normalization
    
    drawTopic(g_topics, topic, "A", MODEL_A_TOPIC_TEXT_X, i * TOPIC_HEIGHT + TOPIC_TEXT_Y + shift_y, rescale=rescale, align="right");
  });

  filtered_topics_B.forEach((topic, i)=> {
    let rescale = topic_rescale * filtered_median / topic.sum_words; // rescale factor based on inverted sum/median normalization
    
    drawTopic(g_topics, topic, "B", MODEL_B_TOPIC_TEXT_X, i * TOPIC_HEIGHT + TOPIC_TEXT_Y + shift_y, rescale=rescale);    
  });

  
}

// draw segregation bars for each topic
function drawSegregation(data_segregation_A, data_segregation_B) {
  const BAR_HEIGHT = 7;
  const BAR_WIDTH_RESCALE = 10;
  const A_X = MODEL_A_X - 5;
  const B_X = MODEL_B_X + 5;

  const g_segregation = svg.append("g")
    .attr("id", "segregation");
  
  g_segregation.append("g")
      .attr("class", "segregation A")
    .selectAll("rect")
    .data(data_segregation_A)
    .enter().append("rect")
      .attr("x", d=>A_X-d*BAR_WIDTH_RESCALE)
      .attr("y", (_, i)=>GRAPH_Y - 20 + i*TOPIC_HEIGHT)
      .attr("height", 7)
      .attr("width", d=>d*BAR_WIDTH_RESCALE)
      .attr("fill", COLOR_MODEL_A);

  g_segregation.append("g")    
      .attr("class", "segregation B")
    .selectAll("rect")
    .data(data_segregation_B)
    .enter().append("rect")
      .attr("x", B_X)
      .attr("y", (_, i)=>GRAPH_Y - 20 + i*TOPIC_HEIGHT)
      .attr("height", 7)
      .attr("width", d=>d*BAR_WIDTH_RESCALE)
      .attr("fill", COLOR_MODEL_B);
}


// -----
// alignment vis 
// -----

function drawAlignment(data_model_names, data_topics_A, data_topics_B, data_alignment) {             
  
  // create nodes, links for each topic
  let data_nodes = []
  data_nodes.push(data_topics_A.map((_, i)=>({
    // topic: d, 
    model_name: data_model_names.A,
    index: i,
    fx: MODEL_A_X,
    fy: GRAPH_Y + i*TOPIC_HEIGHT,
  })));
  data_nodes.push(data_topics_B.map((_, j)=>({
    // topic: d, 
    model_name: data_model_names.B,
    index: j,
    fx: MODEL_B_X,
    fy: GRAPH_Y + j*TOPIC_HEIGHT,
  })));

  let data_links = [];

  // push links from each tm1 topic to each tm2 topic
  data_topics_A.forEach((_, i)=>{
    data_links.push(data_topics_B.map((_, j)=> ({
      source: i,
      target: j + data_topics_A.length, // index of tm2 topic
      alignment: data_alignment[i][j]})));
  });

  // reduce to 1D lists
  data_nodes = data_nodes.flat();
  data_links = data_links.flat(); 

  const simulation = d3.forceSimulation(data_nodes)
    // .force("charge", d3.forceManyBody().strength(-80))
    .force("link", d3.forceLink(data_links))
                      // .distance(20)
                      // .strength(1)
                      // .iterations(10))
    // .force("center", d3.forceCenter(width / 2, height / 2))
    // .on("tick", ticked)
    .stop();

  // tick once to generate link positions
  simulation.tick();

  const g_graph = svg.append("g")
    .attr("id", "graph-alignment");

  const g_graph_links = g_graph.append("g")
    .attr("class", "links");
    
  g_graph_links.selectAll("line")
    .data(data_links)
    .enter().append("line")
      .attr("stroke", d=>{ // TODO: do some thresholding based on other alignments
        // if (d.alignment < 0.5) {
        //   return "black";
        // } else {
        //   return "#604";
        // }
        return COLOR_GREEN_SCALE(d.alignment);
      })
      .attr("stroke-width", d=>d.alignment*10)
      .attr("opacity", d=>d.alignment)
      .attr("x1", d=>d.source.x)
      .attr("y1", d=>d.source.y)
      .attr("x2", d=>d.target.x)
      .attr("y2", d=>d.target.y)

  const g_graph_nodes = g_graph.append("g")
    .attr("class", "nodes");
  
  g_graph_nodes.selectAll("circle")
    .data(data_nodes)
    .enter().append("circle")
      .attr("class", d=>d.model_name)
      .attr("cx", d=>d.x)
      .attr("cy", d=>d.y)
      .attr("fill", d=>(d.model_name === data_model_names.A)? COLOR_MODEL_A : COLOR_MODEL_B); // TODO: replace lda
}

// // draw heatmap of topic-topic alignment across models.
function drawAlignmentHeatMap(data_alignment, data_model_names) {

  // axis labels for heatmap - replace with data_tm1 and data_tm2?

  const FADE_TIME = 200; // transition fade time in ms

  const data_model_A = Array(data_alignment.length).fill().map((_, i)=>"A"+(i+1));
  const data_model_B = Array(data_alignment[0].length).fill().map((_, i)=>"B"+(i+1));

  const HEATMAP_GUTTER = 3;
  const HEATMAP_X = SVG_WIDTH/2 - ALIGNMENT_HEATMAP_GRID_SIZE * data_alignment[0].length/2; // todo replace with data_model_B.length
  const HEATMAP_Y = 350; // TODO fix dynamic
  const HEATMAP_WIDTH = data_alignment[0].length * ALIGNMENT_HEATMAP_GRID_SIZE;
  const HEATMAP_HEIGHT = data_alignment.length * ALIGNMENT_HEATMAP_GRID_SIZE;

  const heatmap = svg.append("g")
    .attr("id", "heatmap-alignment")
    .attr("transform", translateString(HEATMAP_X, HEATMAP_Y) + rotateString(45, HEATMAP_WIDTH/2, HEATMAP_HEIGHT/2));

  const data_alignment_flat = []; // store additional keys (x, y) in flat list

  data_alignment.forEach((row, i) => {
    row.forEach((d, j) => {
      data_alignment_flat.push({
        A_topic: i,
        B_topic: j,
        alignment: d
      });
    });
  });

  // each cell contains rect and text
  const heatmap_cell = heatmap.selectAll("g")
    .data(data_alignment_flat)
    .enter().append("g")
      .attr("class", "cell")
      .attr("transform", d=>translateString(d.B_topic * ALIGNMENT_HEATMAP_GRID_SIZE, d.A_topic * ALIGNMENT_HEATMAP_GRID_SIZE));

      // TODO: rerotate in a g
  const heatmap_cell_text = heatmap_cell.append("text")
    .text(d=>d.alignment.toFixed(2))
    .attr("alignment-baseline", "middle")
    .attr("text-anchor", "middle")
    .attr("class", "noselect")
    .attr("x", ALIGNMENT_HEATMAP_GRID_SIZE / 2)
    .attr("y", ALIGNMENT_HEATMAP_GRID_SIZE / 2)
    // .attr("rotate", -45)
    .attr("fill", d=>((d.alignment > 0.6) ? "white" : "black"))
    .attr("opacity", 0)
    .attr("pointer-events", "none"); // remove mouse interaction so that the rect gets all the mouse events

  heatmap_cell.insert("rect", "text") // add before text
    .attr("rx", HEATMAP_GUTTER)
    .attr("ry", HEATMAP_GUTTER)
    .attr("width", ALIGNMENT_HEATMAP_GRID_SIZE - HEATMAP_GUTTER)
    .attr("height", ALIGNMENT_HEATMAP_GRID_SIZE - HEATMAP_GUTTER)
    .attr("fill", d=>COLOR_GREEN_SCALE(d.alignment))
    .on("mouseover", function(d, i) { // TODO: remove all old [function(d, i) | this] with [function(d, i, nodes) and | nodes[i]]
      d3.select(this.parentNode).select("text")
        .transition(FADE_TIME)
        .attr("opacity", 1);

      // also highlight the linked node and link 

      let source, target;

      d3.select("#graph-alignment").selectAll("line").each((data, j, nodes) => {
        if (i === j) { // TODO: replace this with drawing another stroke on top that's thicker and yellow as a "highlighted stroke"
          d3.select(nodes[j]) // select this link line
            .transition(FADE_TIME)
            .attr("stroke", COLOR_SELECT)
            .attr("opacity", 1);
          source = data.source;
          target = data.target;
        }
      });

      // console.log(source, target);

      d3.select("#graph-alignment").selectAll("circle").each((data, j, nodes) => {
        if (source === data || target === data) {
          d3.select(nodes[j])
            .transition(FADE_TIME)
            .attr("fill", COLOR_SELECT);
        }
      })


    })
    .on("mouseout", function(d, i) {
      d3.select(this.parentNode).select("text")
        .transition(FADE_TIME)
        .attr("opacity", 0);

      d3.select("#graph-alignment").selectAll("line").each((data, j, nodes) => {
        d3.select(nodes[j]) 
          .transition(FADE_TIME)
          .attr("stroke", COLOR_GREEN_SCALE(data.alignment))
          .attr("opacity", data.alignment);
      });

      d3.select("#graph-alignment").selectAll("circle").each((data, j, nodes) => {
        console.log(data);
        d3.select(nodes[j])
          .transition(FADE_TIME)
          .attr("fill", (data.model_name === data_model_names.A)? COLOR_MODEL_A : COLOR_MODEL_B); // TODO: replace lda with A/B
      })

    })

  // axis labels 
  const heatmap_y_labels = heatmap.selectAll(".a")
    .data(data_model_A) // TODO: data_tm1?
    .enter().append("text")
      .text(d=>d)
      .attr("class", "tm_A noselect")
      .attr("x", -10)
      .attr("y", (_, i)=>i*ALIGNMENT_HEATMAP_GRID_SIZE + ALIGNMENT_HEATMAP_GRID_SIZE / 2)
      .attr("rotate", -45)
      .attr("fill", COLOR_MODEL_A)
      .attr("text-anchor", "end")
      .attr("alignment-baseline", "middle");
  // console.log(align_list);

  const heatmap_x_labels = heatmap.selectAll(".b")
    .data(data_model_B) // TODO: data_tm1?
    .enter().append("text")
      .text(d=>d)
      .attr("class", "tm_B noselect")
      .attr("x", (_, i)=>i*ALIGNMENT_HEATMAP_GRID_SIZE + ALIGNMENT_HEATMAP_GRID_SIZE / 2)
      .attr("y", -10)
      .attr("rotate", -45)
      .attr("fill", COLOR_MODEL_B)
      .attr("text-anchor", "middle");

}


// -----
// document vis 
// -----

// --- draw heatmap for doc-topics
function drawDocTopicHeatMap(data_doctopics, placement) {
  
  const is_left = (placement === "left");
  const model = is_left? "A" : "B";

  const HEATMAP_DOCTOPIC_X = is_left? HEATMAP_DOCTOPIC_X_A : HEATMAP_DOCTOPIC_X_B;

  // console.log(data_doctopic);
  // console.log(data_doctopic.length);
  // console.log(data_doctopic.columns.length);

  // axis labels for heatmap - replace with data_tm1 and data_tm2?

  const rows = data_doctopics.length;
  const cols = data_doctopics[0].length;

  const labels_row = Array(rows).fill().map((_, i)=>({ 
    name: "d"+(i+1), 
    row: i, 
    is_left: is_left,
    doc: Object.values(data_doctopics[i]), // map js object -> array
  }));
  const labels_col = Array(cols).fill().map((_, i)=>({
    name: model+(i+1), 
    col: i
  }));

  // console.log(labels_row, labels_col);

  const HEATMAP_GUTTER = 3;
  const HEATMAP_WIDTH = cols * HEATMAP_DOCTOPIC_GRID_SIZE;
  const HEATMAP_HEIGHT = rows * HEATMAP_DOCTOPIC_GRID_SIZE;


  const heatmap = svg.append("g")
    .attr("class", "heatmap doctopic " + model)
    .attr("transform", translateString(HEATMAP_DOCTOPIC_X, HEATMAP_DOCTOPIC_Y));

  const data_doctopic_flat = []; // store additional keys (x, y) in flat list

  data_doctopics.forEach((row, i) => {
    row.forEach((d, j) => {
      data_doctopic_flat.push({
        row: i,
        col: j,
        data: +d
      });
    });
  });

  // console.log(data_doctopic_flat);

  // each cell contains rect and text
  const heatmap_cell = heatmap.append("g")
      .attr("class", "cells")
    .selectAll("g")
      .data(data_doctopic_flat)
    .enter().append("g")
      .attr("class", "cell")
      .attr("transform", d=>translateString(d.col * HEATMAP_DOCTOPIC_GRID_SIZE, d.row * HEATMAP_DOCTOPIC_GRID_SIZE));

  // // tooltip - TODO: update for small heatmap
  // const heatmap_cell_text = heatmap_cell.append("text")
  //   .text(d=>d.data.toFixed(2))
  //   .attr("alignment-baseline", "middle")
  //   .attr("text-anchor", "middle")
  //   .attr("class", "noselect")
  //   .attr("x", HEATMAP_DOCTOPIC_GRID_SIZE / 2)
  //   .attr("y", HEATMAP_DOCTOPIC_GRID_SIZE / 2)
  //   .attr("fill", d=>((d.data > 0.6) ? "white" : "black"))
  //   .attr("opacity", 0)
  
  // heatmap cell
  heatmap_cell.insert("rect", "text") // add before text
    .attr("rx", HEATMAP_GUTTER)
    .attr("ry", HEATMAP_GUTTER)
    .attr("width", HEATMAP_DOCTOPIC_GRID_SIZE - HEATMAP_GUTTER)
    .attr("height", HEATMAP_DOCTOPIC_GRID_SIZE - HEATMAP_GUTTER)
    .attr("fill", d=>is_left? COLOR_RED_SCALE(d.data) : COLOR_BLUE_SCALE(d.data));

    
  // row highlight (for each document)
  const heatmap_row_highlights = heatmap.append("g")
  .attr("class", "highlight");

  const heatmap_row_highlight = heatmap_row_highlights.selectAll(".row")
  .data(labels_row)
  .enter().append("rect")
    .attr("class", "row")
    .attr("transform", d=>translateString(0, d.row * HEATMAP_DOCTOPIC_GRID_SIZE))
    .attr("x", -HEATMAP_GUTTER/2)
    .attr("y", -HEATMAP_GUTTER/2)
    .attr("width", HEATMAP_WIDTH)
    .attr("height", HEATMAP_DOCTOPIC_GRID_SIZE)
    .attr("rx", HEATMAP_GUTTER)
    .attr("ry", HEATMAP_GUTTER)
    
    .attr("stroke", is_left? COLOR_LEFT_HOVER : COLOR_RIGHT_HOVER) 
  // clicked colors: rgb(187, 73, 20) rgb(3, 18, 231);

    .attr("stroke-width", HEATMAP_GUTTER)
    .attr("opacity", 0);

  heatmap_row_highlight
    // click row to view that document
    // TODO: also highlight the row axis label for that document
    .on("mousedown", (_, row)=> {
      replaceDocumentText(row);
      updateTopicSelectHeatMapRow(row);
      selectDocTopicRow(row);
    })

    // TODO: QOL feature - preview the document when hovering without replacing the current document
    .on("mouseover", (_, row) => {
      highlightDocTopicRow(row);
      // highlightBuddyPlotCircles(row);      
    })
    .on("mouseout", (_, row) => {
      hideHighlightDocTopicRow(row);
      // hideHighlightBuddyPlotCircles(row);

    });


  // axis labels 
  const heatmap_row_labels = heatmap.selectAll(".a")
    .data(labels_row) // TODO: data_tm1?
    .enter().append("text")
      .text(d=>d.name)
      .attr("class", "tm_A noselect")
      .attr("x", is_left? -10 : labels_col.length*HEATMAP_DOCTOPIC_GRID_SIZE + HEATMAP_DOCTOPIC_GRID_SIZE / 2)
      .attr("y", d=>d.row*HEATMAP_DOCTOPIC_GRID_SIZE + HEATMAP_DOCTOPIC_GRID_SIZE / 2)
      .attr("font-size", 13)
      .attr("text-anchor", is_left? "end" : "left")
      .attr("alignment-baseline", "middle");
  // console.log(align_list);

  const heatmap_col_labels = heatmap.selectAll(".b")
    .data(labels_col) // TODO: data_tm1?
    .enter().append("text")
      .text(d=>d.name)
      .attr("class", "tm_B noselect")
      .attr("x", d=>d.col*HEATMAP_DOCTOPIC_GRID_SIZE + HEATMAP_DOCTOPIC_GRID_SIZE / 2)
      .attr("y", -10)
      .attr("font-size", 13)
      .attr("fill", is_left? COLOR_MODEL_A : COLOR_MODEL_B)
      .attr("text-anchor", "middle");
      
    selectDocTopicRow(0); // default select first row
    highlightDocTopicRow(0);
}

function highlightDocTopicRow(row) {
  // find all heatmap highlights with the same row index for linked highlighting across both heatmaps
  d3.selectAll(".highlight .row").each((d, i, nodes)=> {
    if(row === d.row) {
      d3.select(nodes[i]) 
      .transition()
        .duration(FADE_IN_TIME)
        .ease(d3.easeSin)
        .attr("opacity", 1);
    }
  });
}

function selectDocTopicRow(row) {
  // make every row unclicked (including in the other heatmap)
  d3.selectAll(".highlight .row").each((d, i, nodes)=> {
    d3.select(nodes[i]).classed("clicked", false);
    fade_out_node(nodes[i], d.is_left? COLOR_LEFT_HOVER : COLOR_RIGHT_HOVER);
  });

  // find all heatmap highlights with the same row index for linked highlighting across both heatmaps
  d3.selectAll(".highlight .row").each((d, i, nodes)=> {
    
    if(row === d.row) {
      d3.select(nodes[i])
        .classed("clicked", true)
        .transition()
          .duration(FADE_IN_TIME)
          .ease(d3.easeSin)
          .attr("stroke", d.is_left? COLOR_LEFT_CLICKED : COLOR_RIGHT_CLICKED);
    }
  });
}

// buddy plots

function drawBuddyPlots(docs_A, docs_B, x_min, width, color_scale) {

  const BUDDY_STROKE_WIDTH = 4;

  // console.log(docs_A[0]);

  // shallow copy is ok, since we make a copy of each row object later on in the .each
  var docs_A_copy = docs_A.slice();
  var docs_B_copy = docs_B.slice();

  docs_A_copy.unshift(d3.range(0, 1.1, 0.1)); // add linear scale from 0 to 1 by 0.1 as a legend line
  docs_B_copy.unshift(d3.range(0, 1.1, 0.1));

  const x_max = x_min + width;

  const buddy_x = d3.scaleLinear()
    .range([x_min, x_max]);

  const buddy_r = 8; // radius of dots

  const g_buddy = svg.append("g")
    .attr("class", "buddyplots")
    .attr("opacity", 0) // hide initially
    .classed("notouch", true);
  
  const g_buddy_line = g_buddy.selectAll("line")
    .data(docs_A_copy)
    .enter().append("g")
      .attr("class", "buddy line")
      .attr("transform", (_, i) => translateString(0, i*buddy_y_gap + buddy_y_min));
  
  g_buddy_line.append("line")
    .attr("x1", x_min)
    .attr("x2", x_max)
    // .attr("y1", 0)
    // .attr("y2", 0)
    .attr("stroke", "black")
    .attr("stroke-width", 2);


  g_buddy_line.each((data, i, nodes) => {
    // this = nodes[i]

    // console.log(data);

    // copy row, change from object to array
    const doc_A = Object.values(data);
    const doc_B = Object.values(docs_B_copy[i]);

    // console.log(doc_A);

    const doc_zip = [];
    doc_A.forEach((d, j) =>{
      doc_zip.push({
        "A": d,
        "B": doc_B[j],
        "i": (i>0)? i-1 : -1, // if the first line (which is linear legend, set both i,j to -1 to skip all interactions)
        "j": (i>0)? j   : -1
      })
    })

    if (i>0) // skip the first line, which is a linear legend
      doc_zip.splice(i-1, 1); // remove document itself (diagonal)

    // console.log(doc_zip);

    const circle_g = d3.select(nodes[i]).selectAll(".dot")
    .data(doc_zip)
    .enter().append("g")
      .attr("class", "buddy circle")
      .attr("transform", d=>translateString(buddy_x(d.A), 0));

    const circle_stroke = circle_g.append("circle")
      .attr("class", "buddy stroke")
      .attr("r", buddy_r)
      .attr("fill", "none")
      .attr("stroke", d=>color_scale(d.B))
      .attr("stroke-width", d=BUDDY_STROKE_WIDTH);

    const circle_fill = circle_g.append("circle")
      .attr("class", "buddy fill")
      // .attr("cy", 0)
      .attr("r", buddy_r)
      .attr("fill", d=>color_scale(d.B))
      .attr("opacity", 0);

    circle_g
      .on("mouseover", d=>{ 
        // console.log("d.i, d.j", d.i, d.j);
        // d.i is the baseline doc of comparison (i.e. this row)
        // d.j is the doc being compared
        highlightDocTopicRow(d.j);
        highlightBuddyPlotCircles(d.j);
      })
      .on("mouseout", d=>{
        hideHighlightDocTopicRow(d.j);
        hideHighlightBuddyPlotCircles(d.j);
      })

    // click document circle to switch to that document
      .on("mousedown", d=>{
        replaceDocumentText(d.j);
        updateTopicSelectHeatMapRow(d.j);
        selectDocTopicRow(d.j);
      });

  });

}

// highlight all buddy plot circles with doc i
function highlightBuddyPlotCircles(doc_i) {
  // find all heatmap highlights with the same row index for linked highlighting across both heatmaps
  d3.selectAll(".buddy.fill").each((d, i, nodes)=> {
    if(doc_i === d.j) {
      d3.select(nodes[i]) 
      .transition()
        .duration(FADE_IN_TIME)
        .ease(d3.easeSin)
        .attr("opacity", 1);
    }
  });
}

// hide highlights of buddy plot circles with doc i
function hideHighlightBuddyPlotCircles(doc_i) {
  // find all heatmap highlights with the same row index for linked highlighting across both heatmaps
  d3.selectAll(".buddy.fill").each((d, i, nodes)=> {
    if(doc_i === d.j) {
      d3.select(nodes[i]) 
      .transition()
        .duration(FADE_IN_TIME)
        .ease(d3.easeSin)
        .attr("opacity", 0);
    }
  });
}



// fade out a highlighted row
function hideHighlightDocTopicRow(row) {
  // find all heatmap highlights with the same row index for linked highlighting across both heatmaps
  d3.selectAll(".highlight .row").each((d, i, nodes)=> {
    if(row === d.row) {
      // const this_left = (d_hover === d)? is_left : !is_left; // if it's the other heatmap, we want to flip is_left so the colour stays correct
      // console.log(d_hover, d, this_left);
      fade_out_node(nodes[i], d.is_left? COLOR_LEFT_HOVER : COLOR_RIGHT_HOVER);
    }
  });
}

// fade out the highlight on a row
function fade_out_highlight(selection, color, time) {
  selection
  .transition()
    .duration(FADE_OUT_TIME)
  .attr("opacity", 0)
  .attr("stroke", color); // reset color to unclicked

}

// fade out the node's row if it's not selected
function fade_out_node(node, color) {
  const selection = d3.select(node);
  if (!selection.classed("clicked")) {
    fade_out_highlight(selection, color);
  }
}

// topic selection heatmap

// initialize with first doc
function drawTopicSelectHeatMaps(data_doctopics_A, data_doctopics_B) {
  const data_A = {
    name: "d1", 
    row: 0, 
    is_left: true,
    doc: Object.values(data_doctopics_A[0]), // map js object -> array
  };

  const data_B = {
    name: "d1", 
    row: 0, 
    is_left: false,
    doc: Object.values(data_doctopics_B[0]), // map js object -> array
  };

  drawTopicSelectHeatMap(data_A);
  drawTopicSelectHeatMap(data_B);
}

function drawTopicSelectHeatMap(data) {

  const name = data.name;
  selected_doc_name = name;

  const row = data.row;

  
  const cols = data.doc.length;
  const is_left = data.is_left;
  const model = is_left? "A" : "B";

  const x = is_left? 290 : 1220;
  const y = row * HEATMAP_DOCTOPIC_GRID_SIZE + HEATMAP_DOCTOPIC_Y;

  const HEATMAP_GUTTER = 4;

  const COLOR_LEFT_HOVER = "rgb(231, 152, 3)";
  const COLOR_RIGHT_HOVER = "rgb(44, 122, 238)";
  const COLOR_LEFT_CLICKED = "rgb(187, 73, 20)";
  const COLOR_RIGHT_CLICKED = "rgb(3, 75, 231)";

  const COLOR_HOVER = is_left? COLOR_LEFT_HOVER : COLOR_RIGHT_HOVER;
  const COLOR_CLICKED = is_left? COLOR_LEFT_CLICKED : COLOR_RIGHT_CLICKED;


  // console.log("data_doc", data.doc);

  const heatmap = svg.append("g")
    .attr("class", "heatmap topicselect " + model + " " +  name)
    .attr("transform", translateString(x, y))
  .append("g") // use another g to shift everything up a little to vertically center the position along the doctopic heatmap
    .attr("class", "shift") 
    .attr("transform", translateString(0, -HEATMAP_DOCTOPIC_GRID_SIZE/2));

  // bg
  heatmap.append("rect")
    .attr("rx", HEATMAP_GUTTER)
    .attr("ry", HEATMAP_GUTTER)
    .attr("transform", translateString(-HEATMAP_GUTTER/2, -HEATMAP_GUTTER/2))    
    .attr("width", cols * TOPICSELECT_HEATMAP_GRID_SIZE)
    .attr("height", TOPICSELECT_HEATMAP_GRID_SIZE)

    .attr("opacity", 0.5)
    .attr("fill", is_left? COLOR_RED_SCALE(0.5) : COLOR_BLUE_SCALE(0.5))
    .attr("stroke", is_left? COLOR_RED_SCALE(0.5) : COLOR_BLUE_SCALE(0.5))
    .attr("stroke-width", HEATMAP_GUTTER + 2);

    // doc label
  heatmap.append("text")
    .text("d"+(row+1).toString())
    .attr("class", "doc label noselect")
    .attr("x", is_left? TOPICSELECT_HEATMAP_GRID_SIZE * cols + TOPICSELECT_HEATMAP_GRID_SIZE / 2 : -TOPICSELECT_HEATMAP_GRID_SIZE / 2)
    .attr("y", TOPICSELECT_HEATMAP_GRID_SIZE/2)
    // .attr("fill", is_left? COLOR_MODEL_A : COLOR_MODEL_B) 
    .attr("font-size", 20)
    // .attr("font-weight", "bold")
    .attr("text-anchor", is_left? "start" : "end")
    .attr("alignment-baseline", "middle");

  const heatmap_cell = heatmap.append("g")
      .attr("class", "cells")
    .selectAll("g")
      .data(data.doc)
    .enter().append("g")
      .attr("class", "cell")
      .attr("transform", (d, col)=>translateString(col * TOPICSELECT_HEATMAP_GRID_SIZE, 0));

  // axis labels 
  heatmap_cell.append("text")
    .text((_, i)=>model + (i+1).toString())
    .attr("class", "topic label noselect")
    .attr("x", TOPICSELECT_HEATMAP_GRID_SIZE / 2 - HEATMAP_GUTTER)
    .attr("y", +TOPICSELECT_HEATMAP_GRID_SIZE + HEATMAP_GUTTER)
    .attr("fill", is_left? COLOR_MODEL_A : COLOR_MODEL_B) 
    .attr("font-size", 16)
    // .attr("font-weight", "bold")
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "hanging");

  // weight labels 
  const heatmap_cell_labels = heatmap_cell.append("text")
    .text(d=>d.toFixed(2))
    .attr("class", "cell label noselect")
    .attr("x", TOPICSELECT_HEATMAP_GRID_SIZE / 2)
    .attr("y", TOPICSELECT_HEATMAP_GRID_SIZE / 2)
    .attr("fill", d=>(d > 0.6)? "white" : "black") 
    .attr("opacity", 0)
    .attr("font-size", 16)
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "middle");
// console.log(align_list);
  

  // heatmap cell
  heatmap_cell.insert("rect", "text") // add before text
    .attr("rx", HEATMAP_GUTTER)
    .attr("ry", HEATMAP_GUTTER)
    .attr("width", TOPICSELECT_HEATMAP_GRID_SIZE - HEATMAP_GUTTER)
    .attr("height", TOPICSELECT_HEATMAP_GRID_SIZE - HEATMAP_GUTTER)
    .attr("fill", d=>is_left? COLOR_RED_SCALE(+d) : COLOR_BLUE_SCALE(+d));

  // col highlight (for each topic)
  const topic_highlights = heatmap.append("g")
  .attr("class", "highlight")

  const topic_highlight = topic_highlights.selectAll(".col")
  .data(data.doc)
  .enter().append("rect")
    .attr("class", "col")
    .attr("transform", (d,col)=>translateString(col * TOPICSELECT_HEATMAP_GRID_SIZE, 0))
    .attr("x", -HEATMAP_GUTTER/2)
    .attr("y", -HEATMAP_GUTTER/2)
    .attr("width", TOPICSELECT_HEATMAP_GRID_SIZE)
    .attr("height", TOPICSELECT_HEATMAP_GRID_SIZE)
    .attr("rx", HEATMAP_GUTTER)
    .attr("ry", HEATMAP_GUTTER)
    .attr("fill", "none")
    .attr("stroke", COLOR_HOVER) 
  // clicked colors: rgb(187, 73, 20) rgb(3, 18, 231);

    .attr("stroke-width", HEATMAP_GUTTER + 2)
    .attr("opacity", 0);


  // hovering and clicking
  topic_highlight
  .on("mousedown", (d, i, nodes)=> {
    changeTopicInDocumentText(i, is_left);

    let this_topic = d3.select(nodes[i]);
    let this_model = d3.select(nodes[i].parentNode);
    this_model.selectAll(".highlight .col").each((d, i, nodes)=> {
      d3.select(nodes[i]).classed("clicked", false);
      fade_out_node(nodes[i], COLOR_HOVER);
    });

    this_topic
      .classed("clicked", true)
      .transition()
        .duration(FADE_IN_TIME)
        .ease(d3.easeSin)
        .attr("stroke", COLOR_CLICKED);
  })

  .on("mouseover", (_, i, nodes) => {

    d3.select(nodes[i]) 
    .transition()
      .duration(FADE_IN_TIME)
      .ease(d3.easeSin)
      .attr("opacity", 1);

    // show corresponding cell label
    heatmap_cell_labels.filter((_, j)=>i===j)    
    .transition()
      .duration(FADE_IN_TIME)
      .ease(d3.easeSin)
      .attr("opacity", 1);
  })

  .on("mouseout", (_, i, nodes) => {
    fade_out_node(nodes[i], COLOR_HOVER);
    heatmap_cell_labels.filter((_, j)=>i===j)    
    .transition()
      .duration(FADE_IN_TIME)
      .ease(d3.easeSin)
      .attr("opacity", 0);
  });

}

// given doc_i (row in doctopic matrix), update topic select heatmap

function updateTopicSelectHeatMapRow(doc_i) {
  const row = {
    name: "d"+(doc_i+1), 
    row: doc_i, 
    is_left: true,
    doc: Object.values(data.doctopics.A[doc_i]), // map js object -> array
  };

  updateTopicSelectHeatMap(row);
}

function updateTopicSelectHeatMap(data) {
  const name = data.name;
  const row = data.row;
  const is_left = data.is_left;
  const model = is_left? "A" : "B";

  const x = is_left? TOPIC_SELECT_DYNAMIC["A"].x : TOPIC_SELECT_DYNAMIC["B"].x;
  const y = row * HEATMAP_DOCTOPIC_GRID_SIZE + HEATMAP_DOCTOPIC_Y;

  const topic_select_heatmap = d3.select(".heatmap.topicselect." + model);
  const cells = topic_select_heatmap.select(".cells");

  const model_opposite = !is_left? "A" : "B";
  const x_opposite = !is_left? TOPIC_SELECT_DYNAMIC["A"].x : TOPIC_SELECT_DYNAMIC["B"].x;
  const topic_select_heatmap_opposite = d3.select(".heatmap.topicselect." + model_opposite);
  const cells_opposite = topic_select_heatmap_opposite.select(".cells");

  // need to grab row's data from the doctopic's highlight rows on the other side
  const data_opposite = d3.selectAll(".heatmap.doctopic." + model_opposite + " .highlight .row").data()[row];
  // console.log(data.doc, data_doc_opposite);

  // update class name to keep track of row
  topic_select_heatmap.classed(selected_doc_name, false)
    .classed(name, true);
  topic_select_heatmap_opposite.classed(selected_doc_name, false)
    .classed(name, true);
  selected_doc_name = name;

  // no need to update highlight data, since it was used to generate the right number of squares
  // no need to update heatmap data either for same reason

  if (!FLAG_TOPIC_SELECT_FIXED) {
      // shift selections y positions to new row
    topic_select_heatmap
    .transition(TOPIC_SELECT_TRANSITION_TIME)
      .ease(d3.easeSin)
      .attr("transform", translateString(x, y));

     topic_select_heatmap_opposite
      .transition(TOPIC_SELECT_TRANSITION_TIME)
        .ease(d3.easeSin)
        .attr("transform", translateString(x_opposite, y));
  }


  // update individual cell data
  cells.selectAll(".cell rect")
    .data(data.doc)
    .transition(FADE_IN_TIME)
      .ease(d3.easeSin)
      .attr("fill", d=>is_left? COLOR_RED_SCALE(+d) : COLOR_BLUE_SCALE(+d));

  cells_opposite.selectAll(".cell rect")
    .data(data_opposite.doc)
    .transition(FADE_IN_TIME)
      .ease(d3.easeSin)
      .attr("fill", d=>!is_left? COLOR_RED_SCALE(+d) : COLOR_BLUE_SCALE(+d));

  // update doc label
  d3.selectAll(".heatmap.topicselect .doc.label")
    .text("d" + (row+1).toString());

  // update cell label
  cells.selectAll(".cell.label")
    .data(data.doc)
    .text(d=>d.toFixed(2))
    .attr("fill", d=>(d > 0.6)? "white" : "black"); 

  // update cell label
  cells_opposite.selectAll(".cell.label")
    .data(data_opposite.doc)
    .text(d=>d.toFixed(2))
    .attr("fill", d=>(d > 0.6)? "white" : "black"); 

}

// --- draw document text view

function drawDocumentText() {

  const DOC_TEXT_WIDTH = 700;
  const DOC_TEXT_HEIGHT = 330;

  const x = SVG_WIDTH/2-DOC_TEXT_WIDTH/2;
  const y = DOCUMENT_TEXT_Y;

  const textbox = svg.append("g")
    .attr("id", "doctext")
    .attr("transform", translateString(x, y));

  textbox.append("rect")
    .attr("width", DOC_TEXT_WIDTH)
    .attr("height", DOC_TEXT_HEIGHT)
    .attr("rx", 15)
    .attr("ry", 15);

  textbox.append("foreignObject")
      .attr("class", "fo") //TODO: i removed noselect from this class. instead, i think it's better if you change the highlight colors in css to a lighter color (and change for topics)
      .attr("width", DOC_TEXT_WIDTH)
      .attr("height", DOC_TEXT_HEIGHT)
    .append("xhtml:div")
      .style("height", DOC_TEXT_HEIGHT)
      .html("");

  replaceDocumentText(0); // load first doc
}

function clearDocumentText() {
  const fo = d3.select("#doctext foreignObject");
  const div = fo.select("div");

  fo.node().scrollTop = 0;// scroll back to top
  div.html("");
}

// same document, click new topic, highlight new words
// select_i is {0, ..., n-1} where n is the number of topics in model
// is_left is {true, false} for which model the topic was changed

function changeTopicInDocumentText(select_i, is_left) {
  const topics_name = data.topics.names;

  const div = d3.select("#doctext foreignObject div");

  
  if (is_left) {
    div.datum().A_select = select_i;
  } else {
    div.datum().B_select = select_i;
  }
  
  // find out which topics are selected in name format (see topics_name)
  let A_select, B_select;
  A_select = "A" + (div.datum().A_select + 1).toString();
  B_select = "B" + (div.datum().B_select + 1).toString();

  // console.log(A_select, B_select);


  div.selectAll("span").each((w, j, nodes)=> {

    // console.log(d, j);

    const this_span = d3.select(nodes[j]);

    if (!this_span.classed("space")) {
      // console.log(d);

      
      let A_weight, B_weight;

      let classname = "";
      
      topics_name.forEach(t_name=> {
        if (t_name === A_select) {
          A_weight = w["freq_"+t_name].toFixed(1).replace(/^0|\./g, ""); // round to 1 decimal, map [0.0, 1.0] |-> [0, 10]
          classname += "A" + "-" + A_weight + " ";
        }

        if (t_name === B_select) {
          B_weight = w["freq_"+t_name].toFixed(1).replace(/^0|\./g, ""); // round to 1 decimal, map [0.0, 1.0] |-> [0, 10]
          classname += "B" + "-" + B_weight + " ";
        }
      });

      this_span.attr("class", classname);
    }
  });

}

// given a document i, change doctext to view that document
// TODO : snazzy document transition
// TODO : change the topics being selected as parameter
// TODO : change highlighted keywords using top N words, 3 color bins

function replaceDocumentText(doc_i) {
 
  // clear the doctext div
  clearDocumentText();

  const topics_name = data.topics.names;
  const topics_reweight = data.topics.reweight.A.concat(data.topics.reweight.B);


  const doc_text = data.texts[doc_i];

  // console.log(doc_text);

  let doc_text_weighted = [];

  const doc_text_split = doc_text.split(" ");
  for(let w_i=0; w_i<doc_text_split.length;w_i++) {
    let word = doc_text_split[w_i];
  // convert lower, remove all [^a-z0-9 ]
    let word_strip = word.toLowerCase().replace(/[^a-z0-9]/g, ""); 
    // console.log(word, word_strip);

    let word_obj = {
      word: word
    };

    // add weight from each topic to the word obj
    for (let t_i=0; t_i<topics_reweight.length; t_i++) {
      const t_name = topics_name[t_i];
      const t_reweight = topics_reweight[t_i];

      // console.log(t_name, t_reweight);

      word_obj["freq_"+t_name] = findTopicWordWeight(t_reweight, word_strip);
    }

    doc_text_weighted.push(word_obj);
  }

  // console.log(doc_text_weighted);

  const div = d3.select("#doctext foreignObject div");

  // initialize the first selected topics as the first ones if not selected
  // otherwise, keep

  // TODO: automatically select the highest weighted topic, and change selector

  if (div.datum() === undefined) {
    div.datum({
      A_select: 0,
      B_select: 0,
    });
  }

  const A_select = "A" + (div.datum().A_select + 1).toString();
  const B_select = "B" + (div.datum().B_select + 1).toString();



  doc_text_weighted.forEach(w=> {

    let classname = "";

    let A_weight, B_weight;
    
    topics_name.forEach(t_name=> {
      if (t_name === A_select) {
        A_weight = w["freq_"+t_name].toFixed(1).replace(/^0|\./g, ""); // round to 1 decimal, map [0.0, 1.0] |-> [0, 10]
        classname += "A" + "-" + A_weight + " ";
      }

      if (t_name === B_select) {
        B_weight = w["freq_"+t_name].toFixed(1).replace(/^0|\./g, ""); // round to 1 decimal, map [0.0, 1.0] |-> [0, 10]
        classname += "B" + "-" + B_weight + " ";
      }
    });

    div.append("span")
    .datum(w)
    .attr("class", classname)
    .html(FLAG_REDACT_DOCUMENT_TEXT? redact(w.word) : w.word)

    div.append("span") //append space between words
    .attr("class", "space")
    .html(" ")
    
  });

  // redact a word
  function redact(string) {
    return "X".repeat(string.length);
  }
}

// --- START ONTOLOGY

function drawOntology(data_onto, data_topics) {
  const data_A_onto = data_onto.map(concept=>concept.A);
  const data_B_onto = data_onto.map(concept=>concept.B);

  console.log(data_onto, data_A_onto, data_B_onto);

  const ONTO_THRESHOLD = 0.00; 
  const onto_max = Math.max(max(data_A_onto), max(data_B_onto));
  const onto_range = [ONTO_THRESHOLD, onto_max];
  const onto_scale = d3.scaleLinear().domain(onto_range);
  const onto_color_scale = d3.scaleSequential(d3.interpolateOranges).domain(onto_range);
                          
  const data_A = {name: "A", topics: data_topics.A.map(topic=>topic.name)}; 
  const data_B = {name: "B", topics: data_topics.B.map(topic=>topic.name)};

  const LABEL_WIDTH = 150; // width of ontology labels, needed for halfgraph to know where to put node

  // main group for ontology. hide at start.
  const g_onto = svg.append("g")
    .attr("id", "graph-ontology")
    .attr("opacity", 0)
    .classed("notouch", true);

  drawOntologyHalfGraph(g_onto, data_onto, data_A, data_A_onto, MODEL_A_X);
  drawOntologyHalfGraph(g_onto, data_onto, data_B, data_B_onto, MODEL_B_X);
  drawOntologyLabels(g_onto, data_onto);

    
  function drawOntologyHalfGraph(parent, data_onto, data_model, data_alignment, model_x) {
    
    const is_left = (model_x < ONTO_X)? -1 : 1;
    const shift = LABEL_WIDTH / 2;
    const onto_x_shift = ONTO_X + shift * is_left; // shift the ontology node's x position a little to the left or right to accomodate label
    
    // create nodes, links for each topic
    let data_nodes = []
    data_nodes.push(data_model.topics.map((d, i)=>({
        topic: d, 
        model_name: data_model.name,
        index: i,
        fx: model_x,
        fy: GRAPH_Y + i*TOPIC_HEIGHT,
    })));
    data_nodes.push(data_onto.map((d, j)=>({
        concept: d, 
        model_name: "ontology",
        index: j,
        fx: onto_x_shift, 
        fy: ONTO_Y + j*ONTO_HEIGHT,
    })));

    let data_links = [];

    // push links from each tm1 topic to each tm2 topic
    data_model.topics.forEach((_, i)=>{
        data_links.push(data_onto.map((_, j)=> ({
        source: i,
        target: j + data_model.topics.length, // index of tm2 topic
        alignment: data_alignment[j][i]})));
    });

    // reduce to 1D lists
    data_nodes = data_nodes.flat();
    data_links = data_links.flat(); 

    // console.log(data_links);

    const simulation = d3.forceSimulation(data_nodes)
        // .force("charge", d3.forceManyBody().strength(-80))
        .force("link", d3.forceLink(data_links))
                        // .distance(20)
                        // .strength(1)
                        // .iterations(10))
        // .force("center", d3.forceCenter(width / 2, height / 2))
        // .on("tick", ticked)
        .stop();

    // tick once to generate link positions
    simulation.tick();

    g_graph = parent.append("g")
        .attr("id", "graph");

    g_graph_links = g_graph.append("g")
        .attr("class", "links");
        
    g_graph_links.selectAll("line")
        .data(data_links)
        .enter().append("line")
        .attr("stroke", d=>{ // TODO: do some thresholding based on other alignments
            // if (d.alignment < 0.5) {
            //   return "black";
            // } else {
            //   return "#604";
            // }
            return onto_color_scale(d.alignment);
            // return "black";
        })
        .attr("stroke-width", d=>onto_scale(d.alignment)*5+5)
        .attr("opacity", d=>{
          if (d.alignment >= ONTO_THRESHOLD) {
            return onto_scale(d.alignment);
          } else {
            return 0;
          }
        })
        .attr("stroke-linecap", "round")
        .attr("x1", d=>d.source.x)
        .attr("y1", d=>d.source.y)
        .attr("x2", d=>d.target.x)
        .attr("y2", d=>d.target.y)

    g_graph_nodes = g_graph.append("g")
        .attr("class", "nodes");

    g_graph_nodes.selectAll("circle")
        .data(data_nodes)
        .enter().append("circle")
        .attr("class", d=>d.model_name)
        .attr("cx", d=>d.x)
        .attr("cy", d=>d.y)
        .attr("fill", d=>(d.model_name == "A")? COLOR_MODEL_A : COLOR_MODEL_B)
        .attr("opacity", d=>(d.model_name == "ontology")? 0 : 1); // hide ontology concept nodes
  }

  function drawOntologyLabels(parent, data_onto) {
    
    const LABEL_R = 3;
    const LABEL_HEIGHT = ONTO_HEIGHT;
    const LABEL_GUTTER = 8;

    const g_onto = parent.append("g")
      .attr("class", "ontology");

    const g_onto_node = g_onto.selectAll("g")
      .data(data_onto)
      .enter().append("g")
      .attr("class", "ontology node")
      .attr("transform", (_, i)=>translateString(ONTO_X, ONTO_Y + i*ONTO_HEIGHT));

    g_onto_node.each((d, i, nodes)=> {
      let g_this = d3.select(nodes[i]);
      g_this.append("rect")
        .attr("x", - LABEL_WIDTH / 2)
        .attr("y", - LABEL_HEIGHT / 2)
        .attr("width", LABEL_WIDTH)
        .attr("height", LABEL_HEIGHT - LABEL_GUTTER)
        .attr("rx", LABEL_R)
        .attr("ry", LABEL_R)

      let text = g_this.append("text")
        .attr("class", "noselect center")
        .attr("font-size", 14)
        .text(d=>d.name);

      console.log(text.node().getComputedTextLength(), LABEL_WIDTH);  

      if (text.node().getComputedTextLength() > LABEL_WIDTH) {
        text.attr("font-size", 10)
        // text.attr("textLength", LABEL_WIDTH)
      }

      let g_onto_tooltip = g_this.append("g")
        .attr("class", "ontology tooltip")
        .attr("opacity", 0);
      
        // TODO: insert text, insert bg rect with calculated textwidth, move text to end (in front)
      // g_onto_tooltip.append("rect")
      //   .attr("x", )

      

    });
    
    
  }


}




// -- end onto



// MISC HELPER FUNCTIONS



// given topic and word, return weight for that word
function findTopicWordWeight(topic, word) {
  
  for (let w of topic.words) {
    // console.log(w, w.word, word, w.word == word);
    if (w.word == word) {
      // console.log("found");
      return w.freq;
    }
  }
  // console.log("word '" + word + "' not found in topic");
  return 0;
}

// given topic, reweight all words by the top word
//   i.e. so that the top word has weight 1
//  TODO: this might not perform well - maybe it's better if we normalize by the sum of the top N words instead
function reweightTopic(topic) {
  const words = topic.words;
  const max = Math.max(...words.map(word=>word.freq));

  const words_reweight = words.map(word=>({
    word: word.word,
    freq: word.freq / max
  }));

  return {
    name: topic.name,
    words: words_reweight
  }
}

// reweight topic by the top n words
// if word is in top n, gets weight 1
// else, gets weight 0
//  TODO: possible reweighting by order/freq in top n?
function reweightTopicTopWords(topic, n) {
  const top_words = filterTopWords(topic, n);

  const words = topic.words;

  // console.log(words);

  const words_binary = words.map(word=>({
    word: word.word,
    freq: (top_words.includes(word))? 1 : 0
  }));

  // console.log(words_binary);

  return {
    name: topic.name,
    words: words_binary
  }
}

// given topic and n, return top n words
function filterTopWords(topic, n) {
  const words = topic.words.slice(0); // make copy for sort
  words.sort((a,b)=>b.freq - a.freq); // sort DESCENDING

  return words.slice(0, n); // return top n
}

// given concepts and n, return top n words
function filterTopConcepts(concepts, n) {
  const concepts_copy = concepts.slice(0); // make copy for sort
  concepts_copy.sort((a,b)=>b.weight - a.weight); // sort DESCENDING

  return concepts_copy.slice(0, n); // return top n
}

function translateString(x, y) {
  return "translate(" + x + "," + y + ")";
}

function rotateString(a, x, y) {
  return "rotate(" + a + "," + x + "," + y + ")";
}

function max(matrix) {
  m = Number.NEGATIVE_INFINITY;
  matrix.forEach(row=>{
    row.forEach(d=> {
      if (d > m) {
        m = d;
      }
    })
  })

  return m;
}

function median(array) {
  array.sort((a,b)=>a-b); // sort ascending

  if(array.length ===0) return 0;

  var half = Math.floor(array.length / 2);

  if (array.length % 2)
    return array[half];
  else
    return (array[half - 1] + array[half]) / 2.0;
}