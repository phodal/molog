# molog

> Serverless frontend logs & events system

Frontend based on [https://github.com/burakson/sherlogjs](https://github.com/burakson/sherlogjs)

![Architecture](./doc/molog-architecture.png)

Usage
---

1.import 

```
 <script
    data-component="homepage"
    data-env="dev"
    src="//static.pho.im/molog.min.js"></script>
```

2.push event

```
Molog.push({
  field: 'xxx'
  action: ' '
}, function() {
 
})
```

LICENSE
---

Sherlog.js Copyright (C) 2014 Burak Son

[![Phodal's Idea](http://brand.phodal.com/shields/idea-small.svg)](http://ideas.phodal.com/)

© 2017 A [Phodal Huang](https://www.phodal.com)'s [Idea](http://github.com/phodal/ideas).  This code is distributed under the MIT license. See `LICENSE` in this directory.
