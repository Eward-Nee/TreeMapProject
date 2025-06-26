import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"
import "./App.css"

function App() {
  const [choice, setChoice] = useState(1)
  let toolTip = useRef()
  const svgAttr = {
    class: "svgHeatMap",
    margin: {
      top: 110,
      bottom: 0,
      left: 0,
      right: 0,
    }
  }

  const mapAttr = {
    width: 960,
    height: 400,
    margin: {
      top: 40,
      bottom: 40,
      left: 40,
      right: 40,
    }
  }
  useEffect(() => {
    d3.select(".svgContainer").selectAll("svg").remove()

    const svg = d3
      .select(".svgContainer")
      .append("svg")
      .attr("width", mapAttr.width + mapAttr.margin.left + mapAttr.margin.right)
      .attr("height", mapAttr.height + mapAttr.margin.bottom + mapAttr.margin.top)
      .attr("class", svgAttr.class)
      .attr("style", `margin:${svgAttr.margin.top}px ${svgAttr.margin.right}px ${svgAttr.margin.bottom}px ${svgAttr.margin.left}px`)

    const g = svg.append("g").attr("transform", `translate(${mapAttr.margin.left},${mapAttr.margin.top})`)

    Promise.all([
      d3.json("https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json"),
      d3.json("https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json"),
      d3.json("https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json")
    ]).then(([KickstarterJSON, MovieJSON, GamesJSON]) => {
      let data
      if (choice == 2) {
        data = MovieJSON
      } else if (choice == 3) {
        data = GamesJSON
      } else {
        data = KickstarterJSON
      }

      data.children.forEach(category => {
        category.children.forEach(project => {
          project.value = +project.value
        })
      })
      render(data)
    })

    function render(data) {
      const root = d3.hierarchy(data).sum(d => d.value)

      const colorScale = d3.scaleOrdinal(d3.schemeCategory10)

      d3.treemap()
        .size([mapAttr.width, mapAttr.height])(root)

      g.selectAll("rect")
        .data(root.leaves())
        .enter()
        .append("rect")
        .attr("class", "tile")
        .attr("x", d => d.x0)
        .attr("y", d => d.y0)
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0)
        .attr("stroke", "black")
        .style("fill", d => colorScale(d.data.category))
        .attr("dataCategory", d => d.data.category)
        .attr("dataName", d => d.data.name)
        .attr("dataValue", d => d.data.value)
        .on("mouseover", e => {
          d3.select(e.currentTarget)
            .attr("data-highlighted", true)

          d3.select(toolTip.current)
            .style("left", e.pageX + 20 + "px")
            .style("top", e.pageY + 20 + "px")
            .text(`Data Name: ${e.target.attributes.dataName.value}, value: ${e.target.attributes.dataValue.value}`)
            .attr("data-value", e.target.attributes.dataValue.value)
            .transition()
            .duration(500)
            .attr("hidden", null)
            .style("opacity", 0.8)
        })
        .on("mousemove", e => {
          d3.select(toolTip.current)
            .style("left", e.pageX + 20 + "px")
            .style("top", e.pageY + 20 + "px")
        })
        .on("mouseout", e => {
          d3.select(e.currentTarget)
            .attr("data-highlighted", false)

          d3.select(toolTip.current)
            .attr("hidden", "")
            .style("opacity", 0)
            .attr("data-education", "")
        })
        .attr("data-name", d => d.data.name)
        .attr("data-category", d => d.data.category)
        .attr("data-value", d => d.data.value)

      // tooltip
      d3.select(toolTip.current)
        .style("position", "absolute")
        .style("opacity", 0)
        .style("background", "black")
        .style("color", "white")
        .style("border", "1px solid black")
        .style("padding", "5px")
        .style("border-radius", "5px")
        .style("pointer-events", "none")

      // legend
      d3.select("#legend").selectAll("*").remove()

      const uniqueCategories = [...new Set(root.leaves().map(d => d.data.category))]

      const legend = d3.select("#legend")
        .append("svg")
        .attr("width", 600)
        .attr("height", uniqueCategories.length * 30)

      legend.selectAll("rect")
        .data(uniqueCategories)
        .enter()
        .append("rect")
        .attr("class", "legend-item")
        .attr("x", 0)
        .attr("y", (_, i) => i * 30)
        .attr("width", 20)
        .attr("height", 20)
        .style("fill", d => colorScale(d))

      legend.selectAll("text")
        .data(uniqueCategories)
        .enter()
        .append("text")
        .attr("x", 30)
        .attr("y", (_, i) => i * 30 + 15)
        .text(d => d)

    }
  }, [choice])

  return (
    <>
      <div id="tooltip" ref={toolTip} hidden></div>
      <div id="title">Tree Map by Eward</div>
      <div id="description">Tree Map of movies, games and kickstarter data</div>
      <button onClick={() => { setChoice(1) }}>kickstarter</button>
      <button onClick={() => { setChoice(2) }}>movies</button>
      <button onClick={() => { setChoice(3) }}>games</button>
      <div className="svgContainer"></div>
      <legend id="legend"></legend>
    </>
  )
}

export default App
