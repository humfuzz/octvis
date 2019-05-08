# OCTVis 

**Ontology-based Comparison of Topics Visualization**

---

To build, compile [Sass](https://sass-lang.com/) (if you made changes) to CSS and then run a local web server (HTML/JS) however you like. 

I used [VS Code](https://code.visualstudio.com/) and the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) and [Live Sass Compiler](https://marketplace.visualstudio.com/items?itemName=ritwickdey.live-sass) extensions. Press *Watch Sass* in the bottom toolbar to compile Sass and *Go Live* to launch the web server.

The vis was tested for Chrome so you may find visual bugs in other browsers.

---

Data format for a dataset `DIR`:

(all UTF-8 with unix LF endings)

/data/`DIR`/

- doc_topic_distr_`MODELA`.txt
- doc_topic_distr_`MODELB`.txt

Document-topic distributions for each model as a headerless csv. Rows are documents, columns are topics.

- vocab.txt

Newline separated vocabulary of dataset.

- word_topic_distr_`MODELA`.txt
- word_topic_distr_`MODELB`.txt

Word-topic distributions for each model as a headerless csv. Rows are topics, columns are words in order given by *vocab.txt*.

- name_dict.json

JSON dictionary mapping ontology abbreviations to full names (e.g. `"BHVR":"Behavior"`).

- umls_r.json

JSON dictionary mapping ontology abbreviations to vocabulary (e.g. `"FNGS": ["truffle", "mushrooms"]`).

For the documents themselves there are two formats you can use:

- a csv with header `ID,Text` followed by each document with numerically increasing ID (0-index) and its text, or

- document files in `/texts/` named 0.txt, 1.txt, etc. with document text

---

To add a new dataset, make a variable in `main.js` with parameters:

```javascript
let data_DATASET = {
    // whatever the file/directory names are for the following
    dir: "DIR", 
    wordtopics_name: "word_topic_distr",
    doctopics_name: "doc_topic_distr",
    vocab_name: "vocab",
    model_a_name: "MODELA",
    model_b_name: "MODELB",
    ontology_map: "umls_r.json",
    ontology_names: "name_dict.json",

    // use this for loading documents from csv
    texts_csv: "texts.csv",

    // or use this for loading documents from /texts/ folder
    doc_start: 0,
    doc_end: 3, // however many there are

    // these are optional parameters that tweak the location of elements in the vis. feel free to add more (see how they are loaded in via main.js and load.js)
    vis_parameters: {
        // replace all words in document text with XXX for sensitive demos
        redact_document_text: false, 

        // highlight the top n keywords in document view 
        n_top_keywords: 10, 

        // rescale model B's color scale's max from [0, 1] to [0, b] to make the blue darker
        rescale_B_max: 0.5,
        
        // shift top of graph
        graph_y: 40,

        // rescale topic word size
        topic_rescale: 0.7,

        // shift top of topics
        topic_shift_y: 10,

        // adjust height of topics
        topic_height: 40,

        // adjust grid sizes for scaling, etc.
        alignment_heatmap_grid_size: 40,
        topicselect_heatmap_grid_size: 40,
        heatmap_doctopic_grid_size: 23,
        heatmap_doctopic_x_a: 70,
        heatmap_doctopic_x_b: 1500,
        document_text_y: 650,

        // run a function after loading in the data
        on_load: function_name,

    }
};
```
See `main.js` for examples. Finally, add this to the `datasets` variable:

```javascript
datasets = {
  sample: data_sample,
  r6: data_reddit6,
  r46: data_reddit_lda4_nmf6,
  NEW_DATASET: data_DATASET
};
```

and create a new html for the data:

```html
<html>
    <meta charset="utf-8">
    <head>
        <link rel="stylesheet" href="css/main.css">
    </head>
    <body>
        <script src="js/lib/d3.js"></script>
        <script src="js/load.js"></script>
        <script src="js/main.js"></script>
        <script>main(datasets.NEW_DATASET)</script>
    </body>
</html>
```