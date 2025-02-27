package common

import (
	"errors"
	"fmt"
	"os"
	"strings"
)

type JobVariable struct {
	Key   string `json:"key"`
	Value string `json:"value"`
}

type JobVariables []JobVariable

func (b JobVariable) String() string {
	return fmt.Sprintf("%s=%s", b.Key, b.Value)
}
func (b JobVariables) StringList() (variables []string) {
	for _, variable := range b {
		variables = append(variables, variable.String())
	}
	return variables
}

func (b JobVariables) Get(key string) string {
	switch key {
	case "$":
		return key
	case "*", "#", "@", "!", "?", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9":
		return ""
	}
	for i := len(b) - 1; i >= 0; i-- {
		if b[i].Key == key {
			return b[i].Value
		}
	}
	return ""
}

func (b JobVariables) ExpandValue(value string) string {
	return os.Expand(value, b.Get)
}

func (b JobVariables) Expand() (variables JobVariables) {
	for _, variable := range b {
		variable.Value = b.ExpandValue(variable.Value)
		variables = append(variables, variable)
	}
	return variables
}

func ParseVariable(text string) (variable JobVariable, err error) {
	keyValue := strings.SplitN(text, "=", 2)
	if len(keyValue) != 2 {
		err = errors.New("missing =")
		return
	}
	variable = JobVariable{
		Key:   keyValue[0],
		Value: keyValue[1],
	}
	return
}
