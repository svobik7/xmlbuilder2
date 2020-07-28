import {
  YAMLWriterOptions, ObjectWriterOptions, XMLSerializedAsObject,
  XMLSerializedAsObjectArray
} from "../interfaces"
import { ObjectWriter } from "./ObjectWriter"
import {
  applyDefaults, isArray, isObject, forEachObject, forEachArray, isEmpty
} from "@oozcitak/util"
import { Node } from "@oozcitak/dom/lib/dom/interfaces"
import { BaseWriter } from "./BaseWriter"

/**
 * Serializes XML nodes into a YAML string.
 */
export class YAMLWriter extends BaseWriter<YAMLWriterOptions, string> {

  /**
   * Produces an XML serialization of the given node.
   * 
   * @param node - node to serialize
   * @param writerOptions - serialization options
   */
  serialize(node: Node, writerOptions?: YAMLWriterOptions): string {
    // provide default options
    const options = applyDefaults(writerOptions, {
      wellFormed: false,
      noDoubleEncoding: false,
      indent: '  ',
      newline: '\n',
      offset: 0,
      group: false,
      verbose: false
    }) as Required<YAMLWriterOptions>

    // convert to object
    const objectWriterOptions: ObjectWriterOptions = applyDefaults(options, {
      format: "object",
      wellFormed: false,
      noDoubleEncoding: false,
    })
    const objectWriter = new ObjectWriter(this._builderOptions)
    const val = objectWriter.serialize(node, objectWriterOptions)

    return this._beginLine(options, 0) + '---' + this._convertObject(val, options, -1, true)
  }

  /**
   * Produces an XML serialization of the given object.
   * 
   * @param obj - object to serialize
   * @param options - serialization options
   * @param level - depth of the XML tree
   * @param indentLeaf - indents leaf nodes
   */
  private _convertObject(obj: string | XMLSerializedAsObject | XMLSerializedAsObjectArray,
    options: Required<YAMLWriterOptions>, level: number = 0, indentLeaf: boolean = false, 
    supressIndent: boolean = false): string {

    let markup = ''

    if (isArray(obj)) {
      for (const val of obj) {
        markup += this._endLine(options, level + 1) +
          this._beginLine(options, level + 2, true) +
          this._convertObject(val, options, level + 1, false, true)
      }
    } else if (isObject(obj)) {
      const leaf = this._isLeafNode(obj)
      if (isEmpty(obj)) {
        markup += ' ""'
      } else {
        forEachObject(obj, (key, val) => {
          if (supressIndent || (leaf && !indentLeaf)) {
            markup += ' "' + key + '":' +
              this._convertObject(val, options, level + 1, true)
          } else {
            markup += this._endLine(options, level + 1) +
              this._beginLine(options, level + 1) +
              '"' + key + '":' +
              this._convertObject(val, options, level + 1, true)
          }
        }, this)
      }
    } else {
      markup += ' "' + obj + '"'
    }
    return markup
  }


  /**
   * Produces characters to be prepended to a line of string in pretty-print
   * mode.
   * 
   * @param options - serialization options
   * @param level - current depth of the XML tree
   * @param isArray - whether this line is an array item
   */
  private _beginLine(options: Required<YAMLWriterOptions>, level: number, isArray: boolean = false): string {
    const indentLevel = options.offset + level + 1
    if (indentLevel > 0) {
      let chars = new Array(indentLevel).join(options.indent)
      if (isArray) {
        return chars.substr(0, chars.length - 2) + '-'
      } else {
        return chars
      }
    }

    return ''
  }

  /**
   * Produces characters to be appended to a line of string in pretty-print
   * mode.
   * 
   * @param options - serialization options
   * @param level - current depth of the XML tree
   */
  private _endLine(options: Required<YAMLWriterOptions>, level: number): string {
    return options.newline
  }

  /**
   * Determines if an object is a leaf node.
   * 
   * @param obj 
   */
  private _isLeafNode(obj: any): boolean {
    return this._descendantCount(obj) <= 1
  }

  /**
   * Counts the number of descendants of the given object.
   * 
   * @param obj 
   * @param count 
   */
  private _descendantCount(obj: any, count: number = 0): number {
    if (isArray(obj)) {
      forEachArray(obj, val => count += this._descendantCount(val, count), this)
    } else if (isObject(obj)) {
      forEachObject(obj, (key, val) => count += this._descendantCount(val, count), this)
    } else {
      count++
    }
    return count
  }
}