---
class:
  - note
created_on: "05-10-2026"
tags:
source:
related:
author:
description:
aliases:
---
By default abstract methods are public and abstract.

Abstract classes can have either **abstract methods** (which must be implemented by it's children/subclasses) or have **concrete methods** which are inherited by its children (meaning subclasses will now have that method built in and does not need @Override unless you want to modify its functionality).

For interfaces, you use it by doing:

```java
public class interfaceOne{
	// all of the methods must be public, cannot be private because interfaces are blueprints.
	public void doSomething{
	}
}
```
```java
public class firstOne implements interfaceOne{

	// if any class implements the interface, aka the blueprint, they must finish this contract by defining all declared methods of the interface by Overriding

	@Override
	public void doSomething{
	System.out.println("#");
	}

```

For interfaces, a class can inherit from multiple interfaces. Normally inheritance you can only inherit from one parent, but the incentive of interfaces is so you can have multiple parents.

> interfaces are collections of abstract methods

Interfaces contains only abstract methods and constants. They are similar to abstract class but the intent of it is to specify behavior for objects.
	For example specify that objects are comparable, edible, cloneable.
	Interface extends multiple interfaces, inheritance multiple interface