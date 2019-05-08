
// take in some metadata (location of data), loads in data, and returns

async function init_data(metadata) {
  
  const DATA_DIR = "data/" + metadata.dir + "/";
  const MODEL_A_NAME = metadata.model_a_name;
  const MODEL_B_NAME = metadata.model_b_name;

  const PREFIX = (typeof metadata.file_prefix !== 'undefined')? metadata.file_prefix + "_" : "";
  
  const VOCAB_FILENAME = (typeof metadata.vocab_name !== 'undefined')? metadata.vocab_name : "vocab";
  const WORDTOPICS_FILENAME = (typeof metadata.wordtopics_name !== 'undefined')? metadata.wordtopics_name : "word_topic_distr";
  const DOCTOPICS_FILENAME = (typeof metadata.doctopics_name !== 'undefined')? metadata.doctopics_name : "doc_topic_distr";

  const DOCTEXTS_DIR = "texts";
  const DOCTEXTS_FILENAME = "data";
  const DOCTEXTS_START = metadata.doc_start;
  const DOCTEXTS_END = metadata.doc_end;

  let data = {
    model_names: {
      A: MODEL_A_NAME,
      B: MODEL_B_NAME
    },
    vis_parameters: metadata.vis_parameters // pass the parameters back
  };
  
  // load word list into array of strings
  data.vocab = d3.csvParseRows(await d3.text(DATA_DIR + PREFIX + VOCAB_FILENAME + ".txt")).map(word => word[0]);
  // console.log(data.vocab);

  // load word topic distributions into array[topic, word]
  async function load_word_topic_distr(model_name) {
    let filename = DATA_DIR + PREFIX + WORDTOPICS_FILENAME + "_" + model_name + ".txt";
    return load_headerless_csv(filename);
  }

  let word_topic_distr_A = await load_word_topic_distr(MODEL_A_NAME);
  let word_topic_distr_B = await load_word_topic_distr(MODEL_B_NAME);
    
  // separate topics and match with words -> drawTopics
  function splitWordTopics(word_topics, model_name) {
    let topics = [];

    word_topics.forEach((topic, i) => {
      let topic_obj = {
        name: model_name + "_t" + (i+1).toString(),
        words: []
      };

      topic.forEach((freq, j) => {
        topic_obj.words.push({
          word: data.vocab[j],
          freq: freq
        });
      });

      topics.push(topic_obj);
    });

    return topics;
  }

  data.topics = {};
  data.topics.A = splitWordTopics(word_topic_distr_A, MODEL_A_NAME);
  // console.log(data.topics_A);
  data.topics.B = splitWordTopics(word_topic_distr_B, MODEL_B_NAME);

  // create array of topic names [A1 ... An, B1 ... Bm] for documents
  data.topics.names = [];
  data.topics.A.forEach((topic, i)=>{
    data.topics.names.push("A" + (i+1).toString());
  });
  data.topics.B.forEach((topic, i)=>{
    data.topics.names.push("B" + (i+1).toString());
  });


  
  // console.log(word_topic_distr_A[0]);  
  // console.log(word_topic_distr_B[0]);  
  // console.log(similarity(word_topic_distr_A[0], word_topic_distr_B[0]));

  // compute topic alignment -> drawAlignment + drawAlignmentHeatMap
  data.alignment = [];
  word_topic_distr_A.forEach(topic_A=>{
    let alignment_row = [];
    word_topic_distr_B.forEach(topic_B=>{
      alignment_row.push(similarity(topic_A, topic_B));
    });
    data.alignment.push(alignment_row);
  })

  // console.log(data.alignment);

  // compute topic segregation -> drawSegregation 

  function computeSegregation(word_topics) {
    let mean_sims = [];
    word_topics.forEach((topic_i, i)=>{
      let sum_sims = 0; // sum of similarities
  
      word_topics.forEach((topic_j, j)=> {
        if (i !== j) { // exclude identity diagonal
          sum_sims += similarity(topic_i, topic_j); // get similarity across topics within same model
        }
      });
      mean_sims.push(sum_sims/(word_topics.length - 1)); // take average of similarities 
    });

    let sum_mean_sims = sum(mean_sims);
    // return mean_sims.map(sim=>(1-sim/sum_mean_sims)); // this is the proper invert, normalized 0-1
    return mean_sims.map(sim=>{
      if (sim === 0) {
        return 5; // cheaty
      } else {
        return sum_mean_sims/sim;
      }
    }); // this is the cheat invert 1/seg that i did before
      
  }
  
  data.segregation = {};
  data.segregation.A = computeSegregation(word_topic_distr_A);
  data.segregation.B = computeSegregation(word_topic_distr_B);
  


  // load doc topic distributions
  // load doc topic distributions into array[topic, word]
  async function load_doc_topic_distr(model_name) {
    let filename = DATA_DIR + PREFIX + DOCTOPICS_FILENAME + "_" + model_name + ".txt";
    return load_headerless_csv(filename);
  }
  data.doctopics = {};
  data.doctopics.A = await load_doc_topic_distr(MODEL_A_NAME);
  data.doctopics.B = await load_doc_topic_distr(MODEL_B_NAME);
  // data.num_docs = data.doctopics.A.length;

  if (typeof DOCTEXTS_START !== 'undefined' && typeof DOCTEXTS_START !== 'undefined') {
    // trim to be length of start and end docs
    const num_docs = DOCTEXTS_END - DOCTEXTS_START + 1;
    data.doctopics.A = data.doctopics.A.slice(0, num_docs);
    data.doctopics.B = data.doctopics.B.slice(0, num_docs);
  }


  
  // compute document similarities -> drawBuddyPlots
  // returns a stupid array of objects instead of a 2D array since that's what old csv expected... TODO: refactor drawBuddyPlots to work with 2D array
  function computeDocumentSimilarities(data_doctopics) {
    const sims = [];
    const columns = [];
    data_doctopics.forEach((doctopic_i, i)=>{
      columns.push(i);

      const sim = {};
      data_doctopics.forEach((doctopic_j, j)=>{
        sim[j] = similarity(doctopic_i, doctopic_j);
      });
      sims.push(sim);    
    });

    return sims;
  }

  data.docsims = {};
  data.docsims.A = computeDocumentSimilarities(data.doctopics.A);
  data.docsims.B = computeDocumentSimilarities(data.doctopics.B);

  // console.log(data.docsims);

  
  
  
  
  // load documents (texts)

  if (typeof metadata.texts_csv !== 'undefined') {
    // load texts from csv file
    let texts = await d3.csv(DATA_DIR + "/" + metadata.texts_csv);
    data.texts = texts.map(row=>row.Text);

  } else {
    // load texts from txts in texts folder

    let text_paths = [];
    for(let i=DOCTEXTS_START; i<=DOCTEXTS_END; i++) {
      const text_path = DATA_DIR + "/" + DOCTEXTS_DIR + "/" + DOCTEXTS_FILENAME + i +".txt";
      text_paths.push(text_path);
    }
  
    data.texts = await Promise.all(text_paths.map(path => d3.text(path)));
  }





  
  // drawDocumentText
  
  // load ontology 
  // compute topic-ontology mapping -> drawOntology 
  const ontology_map = await d3.json(DATA_DIR + "/" + metadata.ontology_map);
  const ontology_names = await d3.json(DATA_DIR + "/" + metadata.ontology_names);
  // console.log(ontology_map);

  data.onto = {}
  data.onto.concepts = [];

  // exclude certain onto concepts
  const excludeTypes = ['TMCO', 'SOCB', 'RNLW', 'RESD', 'RESA', 'QNCO', 'SPCO',
  'QLCO', 'PROS', 'PROG', 'OCDI', 'OCAC', 'LANG', 'INPR',
  'INBE', 'IDCN', 'HUMN', 'GRUP', 'GRPA', 'GORA', 'GEOA',
  'FTCN', 'EEHU', 'EDAC', 'CNCE', 'CLAS', 'BHVR', 'ACTY',
  'MNOB', 'MENP', 'FNDG']

  Object.keys(ontology_map).forEach(concept=>{
    let onto_row = {
      abbr: concept,
      name: ontology_names[concept],
    };

    // skip concept if it's to be excluded
    if (excludeTypes.includes(concept)) {
      return;
    }

    let concept_words = ontology_map[concept];


    // let concept_topic_weights = [];


    let weights_A = data.topics.A.map(()=>0);
    let weights_B = data.topics.B.map(()=>0);
    // go through each word in the concept and add to weight
    concept_words.forEach(concept_word=>{
      

      // console.log(concept_word);
      // find word weight per topic

      
      data.topics.A.forEach((topic, i)=> {
        const topic_word = topic.words.find(topic_word=>topic_word.word === concept_word);

        if (typeof topic_word !== "undefined") {
          weights_A[i] += topic_word.freq;
        }
        //   console.log(concept_word, topic.name, topic_word.freq);
        // } else {
        //   console.log(concept_word, topic.name, "not found");
        // }

      });

      data.topics.B.forEach((topic, i)=> {
        const topic_word = topic.words.find(topic_word=>topic_word.word === concept_word);

        if (typeof topic_word !== "undefined") {
          weights_B[i] += topic_word.freq;
        }
      });

    });
    // concept_topic_weights.push(weight);

    // console.log(concept, concept_words, weights_A, weights_B);
    
    onto_row.A = weights_A;
    onto_row.B = weights_B;
    onto_row.weight_raw = sum(weights_A) + sum(weights_B);

    data.onto.concepts.push(onto_row);
  });

  // normalize concept weights to sum to 1
  const weight_sum = sum(data.onto.concepts.map(concept=>concept.weight_raw));
  data.onto.concepts.forEach(concept=>{
    concept.weight = concept.weight_raw/weight_sum;
  });

  // console.log(data.onto.concepts);





  
  return data;
}

// loads a headerless csv into a 2D array of nums
async function load_headerless_csv(filename) {
  return d3.csvParseRows(await d3.text(filename))
    .map(row => row.map(field => +field)); // convert strings to nums
}

// return sum of numerical array
function sum(a) {
  return a.reduce((acc, n)=> acc+n, 0);
}

// compute cosine similarity between two number arrays
//   requires both arrays to be equal length and data aligned (i.e. matched word indexes)
function similarity(a1, a2) {
  function sum_squares(a) {
    return a.reduce((acc, n)=>acc + n*n, 0);
  }

  // console.log(sum_squares([0.5,1,2,3]));

  let denom = Math.sqrt(sum_squares(a1)) * Math.sqrt(sum_squares(a2));

  // console.log("sumsq a1", sum_squares(a1));
  // console.log("sumsq a2", sum_squares(a2));

  // console.log("denom", denom);

  return a1.reduce((acc, n, i)=>acc + n * a2[i], 0) / denom;
}